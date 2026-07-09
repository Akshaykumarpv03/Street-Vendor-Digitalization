/**
 * ListingSuggestions.jsx — Screen 4: card grid of online marketplace listing
 * options (Google Business, ONDC, Justdial, etc.) with the AI-generated
 * local SEO guidance below.
 */
import { ExternalLink, Globe, AlertCircle } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

const PLATFORMS = [
  {
    name: "Google Business",
    url: "https://business.google.com/",
    desc: "Free local listing on Google Maps and Search",
    icon: "🔍",
  },
  {
    name: "ONDC",
    url: "https://mystore.in/",
    desc: "Government open commerce network",
    icon: "🏛️",
  },
  {
    name: "Justdial",
    url: "https://www.justdial.com/free-listing",
    desc: "Free local business directory",
    icon: "📖",
  },
  {
    name: "IndiaMART",
    url: "https://seller.indiamart.com/",
    desc: "B2B & retail product listings",
    icon: "🛍️",
  },
  {
    name: "WhatsApp Business",
    url: "https://business.whatsapp.com/",
    desc: "Customer messaging & product catalog",
    icon: "💬",
  },
  {
    name: "Meesho",
    url: "https://supplier.meesho.com/",
    desc: "Social commerce + ONDC seller app",
    icon: "📦",
  },
];

export default function ListingSuggestions({ content }) {
  const hasError = !content || content.trim() === "" || content.includes("[Error:");

  return (
    <div className="space-y-4">
      {/* Platform cards */}
      <div className="grid grid-cols-2 gap-3">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:border-teal hover:shadow-md active:scale-[0.98] transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">{p.icon}</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal text-sm group-hover:text-teal transition-colors">
                  {p.name}
                </span>
                <ExternalLink size={12} className="text-slate group-hover:text-teal transition-colors" />
              </div>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">{p.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* AI-generated SEO & listing guidance */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={18} className="text-teal" />
          <h3 className="section-heading mb-0">Local SEO & Marketing Tips</h3>
        </div>
        {hasError ? (
          <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Local SEO Guidance Unavailable</p>
              <p className="text-xs opacity-90 mt-0.5">
                The marketing agent was unable to load search optimization tips. You can still set up your profile on the platforms listed above.
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
