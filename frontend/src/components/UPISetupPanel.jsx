/**
 * UPISetupPanel.jsx — Screen 3: numbered steps for UPI / QR setup
 * and online marketplace listing.
 */
import { CheckCircle2, ExternalLink, Smartphone, AlertCircle } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

const QUICK_LINKS = [
  { label: "PhonePe for Business", url: "https://business.phonepe.com/" },
  { label: "Google Pay for Business", url: "https://pay.google.com/intl/en_in/about/business/" },
  { label: "Paytm for Business", url: "https://business.paytm.com/" },
  { label: "ONDC (myStore)", url: "https://mystore.in/" },
];

export default function UPISetupPanel({ content }) {
  const hasError = !content || content.trim() === "" || content.includes("[Error:");

  return (
    <div className="space-y-4">
      {/* Quick-launch links */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={18} className="text-teal" />
          <h3 className="section-heading mb-0">Quick Links</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-info hover:text-teal
                         border border-sand rounded-xl px-3 py-2.5 hover:border-teal
                         active:scale-[0.98] transition-all duration-150 bg-surface shadow-sm"
            >
              <ExternalLink size={12} className="shrink-0" />
              <span className="truncate">{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* AI-generated guide */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-success" />
          <h3 className="section-heading mb-0">Setup Guide</h3>
        </div>
        {hasError ? (
          <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Setup Guide Unavailable</p>
              <p className="text-xs opacity-90 mt-0.5">
                The UPI agent was unable to load the merchant setup steps. Please verify your internet connection or check the Quick Links above.
              </p>
            </div>
          </div>
        ) : (
          <MarkdownBlock content={content} />
        )}
      </div>
    </div>
  );
}
