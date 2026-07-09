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
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-sand text-slate cursor-not-allowed opacity-50"
        title="Voice input not supported in this browser"
      >
        <MicOff size={20} />
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
      type="button"
      onClick={listening ? stop : start}
      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 ${
        listening
          ? "bg-error text-white ring-4 ring-error/30 animate-pulse"
          : "bg-teal text-white hover:bg-teal-dark hover:shadow shadow-sm"
      }`}
      title={listening ? "Listening... click to stop" : "Start voice dictation"}
    >
      {listening ? (
        <Square size={18} className="animate-spin duration-1000" />
      ) : (
        <Mic size={20} className="hover:scale-110 transition-transform duration-200" />
      )}
    </button>
  );
}
