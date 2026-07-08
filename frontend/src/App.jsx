/**
 * App.jsx — Main application shell.
 *
 * Screens (per README §6.1):
 *  1. Hero / Onboarding        — text + voice input + language selector
 *  2. Business Profile Card    — shareable digital visiting card
 *  3. UPI / QR Setup Panel     — numbered steps + quick links
 *  4. Listing Suggestions      — platform card grid + local SEO tips
 *  5. Promotional Material     — poster/caption preview + WhatsApp share
 *  6. Scheme Tips              — accordion: govt schemes + pricing guidance
 *
 * After the vendor submits a query, results from the backend are displayed
 * across screens 2–6 in a tabbed layout.
 */
import { useState } from "react";
import Hero from "./components/Hero";
import BusinessProfileCard from "./components/BusinessProfileCard";
import UPISetupPanel from "./components/UPISetupPanel";
import ListingSuggestions from "./components/ListingSuggestions";
import PromoMaterial from "./components/PromoMaterial";
import SchemeTips from "./components/SchemeTips";
import {
  LayoutGrid,
  CreditCard,
  Smartphone,
  Globe,
  Megaphone,
  BookOpen,
  ArrowLeft,
  Languages,
} from "lucide-react";

const TABS = [
  { id: "profile",  label: "Profile",   icon: CreditCard  },
  { id: "upi",      label: "UPI Setup",  icon: Smartphone  },
  { id: "listings", label: "Listings",  icon: Globe       },
  { id: "promo",    label: "Promo",     icon: Megaphone   },
  { id: "schemes",  label: "Schemes",   icon: BookOpen    },
];

export default function App() {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const handleResult = (data) => {
    setResult(data);
    setActiveTab("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setResult(null);
    setActiveTab("profile");
  };

  // ── No result yet — show Hero ─────────────────────────────────────────────
  if (!result) {
    return <Hero onResult={handleResult} />;
  }

  const { category, location, sections, translated, language } = result;

  // ── Results layout ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Top header bar ────────────────────────────────────────────────── */}
      <header className="bg-teal text-white px-4 py-3 sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            New Query
          </button>

          <div className="text-center">
            <p className="font-semibold text-sm capitalize">{category}</p>
            {location && (
              <p className="text-white/70 text-xs">{location}</p>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs">
            {translated && (
              <>
                <Languages size={14} className="text-amber" />
                <span className="text-amber font-medium uppercase">{language}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <nav className="bg-surface border-b border-sand sticky top-12 z-10">
        <div className="max-w-2xl mx-auto overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium
                            border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? "border-teal text-teal"
                    : "border-transparent text-slate hover:text-charcoal"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Content area ──────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {activeTab === "profile" && (
          <BusinessProfileCard
            category={category}
            location={location}
            profileText={sections.marketing}
          />
        )}

        {activeTab === "upi" && (
          <UPISetupPanel content={sections.upi_guide} />
        )}

        {activeTab === "listings" && (
          <ListingSuggestions content={sections.marketing} />
        )}

        {activeTab === "promo" && (
          <PromoMaterial
            content={sections.marketing}
            category={category}
            location={location}
          />
        )}

        {activeTab === "schemes" && (
          <SchemeTips
            policyContent={sections.policy_scheme}
            marketContent={sections.market_insights}
          />
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="text-center text-slate text-xs py-6 border-t border-sand mt-8">
        Street Vendor Digitalization Agent · Powered by IBM Granite ·{" "}
        {import.meta.env.VITE_USE_MOCK === "true" && (
          <span className="text-amber font-medium">Demo / Mock Mode</span>
        )}
      </footer>
    </div>
  );
}
