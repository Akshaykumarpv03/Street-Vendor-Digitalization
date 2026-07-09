/**
 * PromoMaterial.jsx — Screen 5: generated poster/caption preview with
 * "Share to WhatsApp" and copy buttons.
 */
import { useState } from "react";
import { Copy, MessageCircle, AlertCircle, Check } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

export default function PromoMaterial({ content, category, location }) {
  const [copied, setCopied] = useState(false);

  const hasError = !content || content.trim() === "" || content.includes("[Error:");

  // Extract the first WhatsApp caption block from the content
  const captionMatch = !hasError && content?.match(/WhatsApp.*?\n([\s\S]*?)(?:\n\n|\n---|\n\*\*)/i);
  const caption = hasError ? "" : (captionMatch?.[1]?.trim() || content?.slice(0, 280) || "");

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;

  const handleCopy = () => {
    if (hasError) return;
    navigator.clipboard.writeText(content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 relative overflow-hidden">
      {/* Preview card — styled like a poster */}
      <div className="card bg-gradient-to-br from-teal to-teal-dark text-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold bg-amber text-charcoal px-3 py-1 rounded-full capitalize">
            {category || "Street Vendor"}
          </span>
          {location && (
            <span className="text-xs text-white/80 font-medium">📍 {location}</span>
          )}
        </div>
        
        {hasError ? (
          <p className="text-sm italic opacity-75">
            Promotional content is currently unavailable.
          </p>
        ) : (
          <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
            {caption || "Your promotional content will appear here."}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          disabled={hasError}
          className="flex-1 flex items-center justify-center gap-2 bg-surface border border-sand
                     text-charcoal rounded-xl py-3.5 text-sm font-medium hover:border-teal
                     hover:text-teal active:scale-[0.98] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <Copy size={16} />
          <span>Copy All</span>
        </button>
        <a
          href={hasError ? undefined : shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => hasError && e.preventDefault()}
          className={`flex-1 flex items-center justify-center gap-2 bg-success text-white
                     rounded-xl py-3.5 text-sm font-medium hover:bg-success-dark active:scale-[0.98]
                     transition-all duration-150 shadow-sm ${
                       hasError ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
                     }`}
        >
          <MessageCircle size={16} />
          <span>Share to WhatsApp</span>
        </a>
      </div>

      {/* Full AI-generated content */}
      <div className="card">
        <h3 className="section-heading">Full Promotional Content</h3>
        {hasError ? (
          <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Promotional Material Unavailable</p>
              <p className="text-xs opacity-90 mt-0.5">
                The marketing agent was unable to generate advertising text. Please try again.
              </p>
            </div>
          </div>
        ) : (
          <MarkdownBlock content={content} />
        )}
      </div>

      {/* Toast Notification */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-charcoal text-white text-xs px-3.5 py-2 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <Check size={14} className="text-success" />
        <span>Content copied to clipboard!</span>
      </div>
    </div>
  );
}
