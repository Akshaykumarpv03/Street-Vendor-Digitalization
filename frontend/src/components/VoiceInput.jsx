/**
 * VoiceInput.jsx — Web Speech API voice-to-text button.
 * Gracefully degrades (shows mic icon as disabled) if the browser
 * doesn't support SpeechRecognition.
 */
import { useState, useRef } from "react";
import { Mic, MicOff, Square } from "lucide-react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput({ onTranscript, language = "en" }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  if (!SpeechRecognition) {
    return (
      <button
        disabled
        className="p-4 rounded-full bg-sand text-slate cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <MicOff size={22} />
      </button>
    );
  }

  const start = () => {
    const rec = new SpeechRecognition();
    rec.lang = language === "en" ? "en-IN" : language;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
      setListening(false);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <button
      onClick={listening ? stop : start}
      className={`p-4 rounded-full transition-all duration-200 ${
        listening
          ? "bg-error text-white animate-pulse"
          : "bg-teal text-white hover:bg-teal-dark"
      }`}
      title={listening ? "Stop recording" : "Start voice input"}
    >
      {listening ? <Square size={22} /> : <Mic size={22} />}
    </button>
  );
}
