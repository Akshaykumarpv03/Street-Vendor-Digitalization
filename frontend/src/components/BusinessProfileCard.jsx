/**
 * BusinessProfileCard.jsx — Screen 2: shareable digital visiting card.
 * Shows the vendor's category, location, and extracted business profile
 * from the marketing section.
 */
import { MapPin, Tag, Share2, Copy } from "lucide-react";
import { useState } from "react";

export default function BusinessProfileCard({ category, location, profileText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Business Profile",
        text: profileText,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="card border-l-4 border-l-teal">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-teal font-bold text-xl capitalize">
            {category || "Street Vendor"}
          </h2>
          {location && (
            <div className="flex items-center gap-1 text-slate text-sm mt-1">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-sand text-slate hover:bg-amber hover:text-charcoal transition-colors"
            title="Copy profile"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-teal text-white hover:bg-teal-dark transition-colors"
            title="Share profile"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-4">
        <Tag size={14} className="text-amber" />
        <span className="text-xs bg-amber/10 text-amber-dark border border-amber/30 px-2 py-0.5 rounded-full capitalize">
          {category}
        </span>
      </div>

      {/* Profile text preview */}
      {profileText && (
        <div className="bg-cream rounded-xl p-4 text-sm text-charcoal whitespace-pre-wrap leading-relaxed border border-sand">
          {profileText.slice(0, 400)}
          {profileText.length > 400 && "…"}
        </div>
      )}

      {copied && (
        <p className="text-success text-xs mt-2 text-center">
          ✓ Copied to clipboard
        </p>
      )}
    </div>
  );
}
