/**
 * ChatPanel.jsx — Premium "Apple meets IBM" conversational terminal themed for Vyapar Setu (MD3 Light).
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAgent } from "../api";
import MarkdownBlock from "./MarkdownBlock";

/* ── Framer variants ──────────────────────────────────────────────────────── */
const msgVariants = {
  hidden:  { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
             transition: { type: "spring", stiffness: 380, damping: 30 } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

/* ── 3-dot bouncing loader ────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      variants={msgVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-start gap-2.5 justify-start"
    >
      <AgentAvatar />
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm
                      bg-surface-container border border-outline-variant shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="block h-2 w-2 rounded-full bg-primary/70 typing-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        <span className="ml-2 text-xs text-on-surface-variant select-none">thinking…</span>
      </div>
    </motion.div>
  );
}

/* ── Agent avatar pill ────────────────────────────────────────────────────── */
function AgentAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full
                    bg-gradient-to-br from-brand-500 to-sky-400 text-white
                    flex items-center justify-center shadow-md shadow-brand-500/20">
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function ChatPanel({ initialMessage, initialReply, onBack, currentLanguage }) {
  const [messages, setMessages] = useState(() => {
    const init = [];
    if (initialMessage) init.push({ role: "user", content: initialMessage });
    if (initialReply) init.push({ role: "assistant", content: initialReply });
    return init;
  });
  const [input, setInput]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  /* Auto-fetch initial query if no initial reply exists */
  useEffect(() => {
    if (initialMessage && !initialReply && messages.length === 1) {
      let isMounted = true;
      const fetchInitial = async () => {
        setIsLoading(true);
        try {
          const query = currentLanguage && currentLanguage !== "en"
            ? `${initialMessage} (Please respond in ${currentLanguage})`
            : initialMessage;
          const data = await chatWithAgent(query);
          if (isMounted) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: data.message || data.reply || "No response received." }
            ]);
          }
        } catch {
          if (isMounted) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "⚠️ Connection error — please retry." }
            ]);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchInitial();
      return () => { isMounted = false; };
    }
  }, [initialMessage, initialReply, currentLanguage]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* Focus input on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const query =
        currentLanguage && currentLanguage !== "en"
          ? `${trimmed} (Please respond in ${currentLanguage})`
          : trimmed;
      const data = await chatWithAgent(query);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || data.reply || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection error — please retry." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-4xl flex flex-col h-[76vh] md:h-[82vh] mx-auto
                    bg-white border border-slate-200/60
                    rounded-3xl shadow-2xl shadow-brand-900/5 overflow-hidden anim-fade-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between
                         px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 rounded-full
                     text-slate-500 hover:text-brand-700 hover:bg-brand-50 text-sm font-semibold
                     border border-transparent hover:border-brand-100 transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">arrow_back</span>
          Back to Home
        </button>

        {/* Status badge */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
            watsonx Connected
          </span>
        </div>

        {/* Language badge */}
        {currentLanguage && (
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-full
                           bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">
            {currentLanguage}
          </span>
        )}
      </header>

      {/* ── Message area ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 slim-scroll relative bg-slate-50/50">
        {/* Background decorative blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-200/20 rounded-full blur-[80px] pointer-events-none -z-10" />

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              variants={msgVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex w-full gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar (agent only) */}
              {msg.role === "assistant" && <AgentAvatar />}

              {/* Bubble */}
              <div
                className={
                  msg.role === "user"
                    /* User — Vibrant Gradient */
                    ? `max-w-[80%] px-5 py-3.5 rounded-2xl rounded-tr-sm
                       bg-gradient-to-r from-brand-600 to-sky-500
                       text-white text-[15px] leading-relaxed shadow-md shadow-brand-500/20`
                    /* Agent — Clean White Glass */
                    : `max-w-[85%] px-5 py-4 rounded-2xl rounded-tl-sm
                       bg-white border border-slate-100 text-slate-800 shadow-sm`
                }
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="chat-prose">
                    <MarkdownBlock content={msg.content} variant="light" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator key="typing" />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input footer ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4 z-10">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3 max-w-4xl mx-auto"
        >
          <div className="flex-1 relative group">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Type your message here..."
              className="w-full resize-none overflow-hidden min-h-[52px]
                         bg-slate-50 border border-slate-200 rounded-2xl
                         pl-5 pr-14 py-3.5 text-[15px] text-slate-800
                         placeholder-slate-400
                         focus:outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         leading-relaxed shadow-inner"
            />
          </div>

          {/* Send icon button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                       rounded-full bg-brand-600 text-white
                       hover:bg-brand-500 hover:scale-105 active:scale-95
                       transition-all duration-200
                       disabled:opacity-40 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed
                       disabled:scale-100 shadow-md shadow-brand-500/20 disabled:shadow-none"
            title="Send (Enter)"
          >
            <span className="material-symbols-outlined select-none text-[22px] -mt-0.5 ml-0.5">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
