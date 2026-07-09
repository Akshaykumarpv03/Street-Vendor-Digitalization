/**
 * BusinessProfileCard.jsx — Screen 2: shareable digital visiting card.
 */
import { MapPin, Tag, Share2, Copy, AlertCircle, Check } from "lucide-react";
import { useState } from "react";

export default function BusinessProfileCard({ category, location, profileText }) {
  const [copied, setCopied] = useState(false);

  const hasError = !profileText || profileText.trim() === "" || profileText.includes("[Error:");

  const handleCopy = () => {
    if (hasError) return;
    navigator.clipboard.writeText(profileText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (hasError) return;
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
    <div className="card border-l-4 border-l-teal relative overflow-hidden transition-all duration-300 hover:shadow-md">
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
            disabled={hasError}
            className="p-2.5 rounded-xl bg-sand text-slate hover:bg-amber hover:text-charcoal active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Copy profile"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleShare}
            disabled={hasError}
            className="p-2.5 rounded-xl bg-teal text-white hover:bg-teal-dark active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Share profile"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-4">
        <Tag size={14} className="text-amber" />
        <span className="text-xs bg-amber/10 text-amber-dark border border-amber/30 px-2.5 py-0.5 rounded-full capitalize font-medium">
          {category}
        </span>
      </div>

      {/* Profile text preview / Error handling */}
      {hasError ? (
        <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Business Profile Unavailable</p>
            <p className="text-xs opacity-90 mt-0.5">
              The marketing agent was unable to generate a business profile. The other sections might still have valid suggestions.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-cream rounded-xl p-4 text-sm text-charcoal whitespace-pre-wrap leading-relaxed border border-sand">
          {profileText.slice(0, 400)}
          {profileText.length > 400 && "…"}
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-charcoal text-white text-xs px-3.5 py-2 rounded-full shadow-lg transition-all duration-300 pointer-events-none ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <Check size={14} className="text-success" />
        <span>Profile copied to clipboard!</span>
      </div>
    </div>
  );
}
