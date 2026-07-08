/**
 * PromoMaterial.jsx — Screen 5: generated poster/caption preview with
 * "Share to WhatsApp" and copy buttons.
 */
import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

export default function PromoMaterial({ content, category, location }) {
  const [copied, setCopied] = useState(false);

  // Extract the first WhatsApp caption block from the content
  const captionMatch = content?.match(/WhatsApp.*?\n([\s\S]*?)(?:\n\n|\n---|\n\*\*)/i);
  const caption = captionMatch?.[1]?.trim() || content?.slice(0, 280) || "";

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Preview card — styled like a poster */}
      <div className="card bg-gradient-to-br from-teal to-teal-dark text-white border-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium bg-amber text-charcoal px-2.5 py-0.5 rounded-full capitalize">
            {category || "Street Vendor"}
          </span>
          {location && (
            <span className="text-xs text-white/70">📍 {location}</span>
          )}
        </div>
        <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
          {caption || "Your promotional content will appear here."}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 bg-surface border border-sand
                     text-charcoal rounded-xl py-3 text-sm font-medium hover:border-teal
                     hover:text-teal transition-colors"
        >
          <Copy size={16} />
          {copied ? "Copied!" : "Copy All"}
        </button>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-success text-white
                     rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={16} />
          Share to WhatsApp
        </a>
      </div>

      {/* Full AI-generated content */}
      <div className="card">
        <h3 className="section-heading">Full Promotional Content</h3>
        <MarkdownBlock content={content} />
      </div>
    </div>
  );
}
