/**
 * Hero.jsx — Onboarding / Hero screen (Screen 1 per README §6.1).
 *
 * Large text input + voice mic button + language selector chips.
 * On submit, calls queryOrchestrator() and lifts the result to App.jsx.
 */
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import VoiceInput from "./VoiceInput";
import { queryOrchestrator } from "../api";

export default function Hero({ onResult }) {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);
    try {
      const result = await queryOrchestrator(trimmed, language);
      onResult(result);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = (transcript) => {
    setMessage(transcript);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal mb-4">
          <span className="text-3xl">🛒</span>
        </div>
        <h1 className="text-2xl font-bold text-teal mb-1">
          Street Vendor Agent
        </h1>
        <p className="text-slate text-sm">
          Powered by IBM Granite · Grow your business digitally
        </p>
      </div>

      {/* Input card */}
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <p className="text-charcoal font-medium text-center">
            Tell us about your business
          </p>

          {/* Example hint */}
          <p className="text-slate text-xs text-center italic">
            e.g. &ldquo;I sell fruit in Pune&rsquo;s Camp area&rdquo;
          </p>

          {/* Text input + mic */}
          <div className="flex gap-3 items-end">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={3}
              placeholder="Describe what you sell and where…"
              className="flex-1 resize-none rounded-xl border border-sand bg-surface px-4 py-3
                         text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal
                         placeholder-slate"
            />
            <VoiceInput onTranscript={handleVoice} language={language} />
          </div>

          {/* Language chips */}
          <div>
            <p className="text-xs text-slate mb-2 text-center">
              Response language
            </p>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {/* Error */}
          {error && (
            <p className="text-error text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analysing your business…
              </>
            ) : (
              <>
                <Send size={18} />
                Get Recommendations
              </>
            )}
          </button>
        </form>

        {/* Feature chips */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {[
            "📋 Govt Schemes",
            "💰 Pricing Tips",
            "📱 UPI Setup",
            "📣 Marketing",
          ].map((f) => (
            <span
              key={f}
              className="text-xs bg-surface border border-sand text-slate px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
