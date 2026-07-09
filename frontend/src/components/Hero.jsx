/**
 * Hero.jsx — Onboarding / Hero screen (Screen 1 per README §6.1).
 *
 * Welcoming onboarding with voice/text input, language chips, quick suggestions,
 * and an animated multi-agent progress loader.
 */
import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, HelpCircle, AlertCircle, RefreshCw } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import VoiceInput from "./VoiceInput";
import { chatWithAgent } from "../api";

const SUGGESTIONS = [
  { text: "I sell fruit in Pune's Camp area", label: "🍎 Fruit Vendor, Pune" },
  { text: "I run a tea stall near Kalyan station, Thane", label: "☕ Tea Stall, Thane" },
  { text: "I sell street snacks in Jaipur market", label: "🍢 Food Stall, Jaipur" },
  { text: "I sell hand-made bangles in Hyderabad Charminar", label: "📿 Bangles, Hyderabad" }
];

const LOADING_STAGES = [
  { text: "Connecting to IBM watsonx Orchestrate...", progress: 10, agent: "orchestrator" },
  { text: "Sending query to AI agent...", progress: 30, agent: "orchestrator" },
  { text: "Agent is analyzing your business...", progress: 55, agent: "orchestrator" },
  { text: "Generating personalized recommendations...", progress: 80, agent: "orchestrator" },
  { text: "Finalizing response...", progress: 95, agent: "orchestrator" }
];

export default function Hero({ onResult }) {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Loading animation state
  const [stageIndex, setStageIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const progressTimerRef = useRef(null);
  const stageTimerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      // Start fake progress bar
      setFakeProgress(0);
      setStageIndex(0);

      // Increment progress slowly up to 95%
      progressTimerRef.current = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev >= 95) return prev;
          const currentStageTarget = LOADING_STAGES[stageIndex]?.progress || 95;
          const delta = (currentStageTarget - prev) * 0.08 + 0.5;
          return Math.min(prev + delta, 95);
        });
      }, 250);

      // Cycle loading stages every 3 seconds
      stageTimerRef.current = setInterval(() => {
        setStageIndex((prev) => {
          if (prev < LOADING_STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
    };
  }, [loading, stageIndex]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);
    try {
      // Append language instruction if non-English
      const query =
        language !== "en"
          ? `${trimmed}\n\nPlease respond in the user's selected language code: ${language}.`
          : trimmed;
      const response = await chatWithAgent(query);
      setFakeProgress(100);
      setTimeout(() => {
        onResult({
          userQuery: trimmed,
          agentReply: response.message || response.reply || "No response received.",
          language,
        });
      }, 500);
    } catch (err) {
      setError(err.message || "Unable to connect to watsonx servers. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = (transcript) => {
    setMessage(transcript);
  };

  const handleSuggestionClick = (text) => {
    setMessage(text);
  };

  // ── Render Loading Panel ──────────────────────────────────────────────────
  if (loading) {
    const currentStage = LOADING_STAGES[stageIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream animate-in fade-in duration-300">
        <div className="w-full max-w-md card space-y-6 text-center shadow-lg border-2 border-sand relative overflow-hidden">
          {/* Animated top background glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal via-amber to-teal animate-pulse" />

          <div className="pt-4 flex justify-center">
            <div className="relative flex items-center justify-center w-20 h-20">
              <Loader2 size={44} className="text-teal animate-spin absolute" />
              <Sparkles size={20} className="text-amber animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-teal">Analysing Your Business</h2>
            <p className="text-xs text-slate h-10 px-4 leading-relaxed font-medium flex items-center justify-center">
              {currentStage?.text}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate font-medium px-1">
              <span>Agent Progress</span>
              <span className="text-teal font-bold">{Math.round(fakeProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-teal transition-all duration-300 ease-out rounded-full"
                style={{ width: `${fakeProgress}%` }}
              />
            </div>
          </div>

          {/* Agent pipeline steps */}
          <div className="bg-cream/50 rounded-xl p-4 text-left border border-sand space-y-2">
            <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2 text-center opacity-75">
              Agent Pipeline
            </p>
            {[
              { label: "Authenticate with IBM Cloud IAM" },
              { label: "Route query to Orchestrate Agent" },
              { label: "Analyse business context" },
              { label: "Generate recommendations" },
              { label: "Return structured response" },
            ].map((step, i) => {
              let statusText = "Waiting...";
              let statusColor = "text-slate opacity-40";

              if (i < stageIndex) {
                statusText = "Completed";
                statusColor = "text-success font-semibold";
              } else if (i === stageIndex) {
                statusText = "Running...";
                statusColor = "text-amber font-semibold animate-pulse";
              }

              return (
                <div key={i} className="flex justify-between items-center text-xs border-b border-sand/50 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-charcoal font-medium">{step.label}</span>
                  <span className={statusColor}>{statusText}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate italic">
            Your query is routed live to IBM watsonx Orchestrate — this may take up to 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  // ── Render Hero Input ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-cream">
      {/* Brand Header */}
      <div className="mb-6 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal mb-3 shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
          <span className="text-3xl">🛒</span>
        </div>
        <h1 className="text-3xl font-extrabold text-teal tracking-tight mb-1">
          Street Vendor Digitalization
        </h1>
        <p className="text-slate text-sm font-medium px-4 leading-relaxed">
          Unlock government schemes, setup online sales, accept UPI payments, and generate marketing campaigns.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {/* Error Alert Box */}
        {error && (
          <div className="bg-error/5 text-error border border-error/20 rounded-2xl p-4 flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-sm font-bold">Recommendations Failed</p>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{error}</p>
              <button
                onClick={() => setError("")}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                <RefreshCw size={12} />
                Reset & Clear Error
              </button>
            </div>
          </div>
        )}

        {/* Input Card Form */}
        <form onSubmit={handleSubmit} className="card space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-1">
            <h2 className="text-charcoal font-bold text-md text-center">
              Describe Your Business
            </h2>
            <p className="text-slate text-xs text-center leading-relaxed">
              Tell us what you sell, where you are located, and what you need help with. We support English and local Indian languages.
            </p>
          </div>

          {/* Text input + mic */}
          <div className="flex gap-3 items-stretch">
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
              placeholder="e.g., I sell fresh seasonal fruits at MG Road street corner in Pune Camp..."
              className="flex-1 resize-none rounded-xl border border-sand bg-surface px-4 py-3
                         text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-teal
                         placeholder-slate/60 leading-relaxed shadow-inner min-h-[44px] touch-manipulation"
            />
            <div className="flex flex-col justify-end">
              <VoiceInput onTranscript={handleVoice} language={language} />
            </div>
          </div>

          {/* Quick-Start suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-slate text-[11px] font-bold uppercase tracking-wider px-0.5 opacity-80">
              <Sparkles size={11} className="text-amber" />
              <span>Tap a suggestion to try:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(s.text)}
                  className="text-left text-xs bg-cream hover:bg-sand border border-sand hover:border-teal/50 text-charcoal px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] font-medium truncate"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language chips */}
          <div className="space-y-2 border-t border-sand/50 pt-4">
            <p className="text-xs font-bold text-slate uppercase tracking-wider text-center opacity-85">
              Select Output Language
            </p>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 h-[48px] text-base active:scale-98"
          >
            <Send size={18} />
            <span>Generate Business Plan</span>
          </button>
        </form>

        {/* Feature list chips */}
        <div className="flex flex-wrap gap-2 justify-center opacity-85">
          {[
            "📋 Schemes (PM-SVANidhi)",
            "💰 Mandi & Pricing Guide",
            "💳 Merchant UPI setup",
            "📢 WhatsApp Promos & SEO"
          ].map((f) => (
            <span
              key={f}
              className="text-[11px] font-medium bg-surface border border-sand text-slate px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
