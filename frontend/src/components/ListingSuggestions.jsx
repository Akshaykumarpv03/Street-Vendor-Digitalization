/**
 * ListingSuggestions.jsx — Screen 4: card grid of online marketplace listing
 * options (Google Business, ONDC, Justdial, etc.) with the AI-generated
 * local SEO guidance below.
 */
import { ExternalLink, Globe } from "lucide-react";
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
            className="card hover:border-teal hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-charcoal text-sm group-hover:text-teal">
                {p.name}
              </span>
              <ExternalLink size={12} className="text-slate group-hover:text-teal" />
            </div>
            <p className="text-xs text-slate mt-1">{p.desc}</p>
          </a>
        ))}
      </div>

      {/* AI-generated SEO & listing guidance */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={18} className="text-teal" />
          <h3 className="section-heading mb-0">Local SEO & Marketing Tips</h3>
        </div>
        <MarkdownBlock content={content} />
      </div>
    </div>
  );
}
