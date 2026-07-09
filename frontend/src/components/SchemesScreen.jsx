/**
 * SchemesScreen.jsx — Government Schemes + Market Pricing Helper
 * React port of the Vyapar Setu reference design.
 */
import { useState } from "react";

const SCHEMES = [
  {
    id: "svanidhi",
    icon: "storefront",
    title: "PM SVANidhi",
    subtitle: "Up to ₹50,000 micro-credit",
    description: "A special micro-credit facility for street vendors to resume their livelihoods. Get working capital loans without collateral.",
    tags: [
      { label: "No Collateral",     color: "bg-secondary-container text-on-secondary-container" },
      { label: "7% Interest Subsidy", color: "bg-primary-container/20 text-primary" },
      { label: "Digital Cashback",  color: "bg-tertiary-container/20 text-tertiary-container" },
    ],
    cta: { label: "Apply Now", style: "btn-filled" },
    tip: "Repaying your 1st loan on time makes you eligible for a ₹20,000 second loan with zero extra paperwork."
  },
  {
    id: "mudra",
    icon: "trending_up",
    title: "MUDRA Loan (Shishu)",
    subtitle: "Loans up to ₹50,000",
    description: "Support for micro-enterprises in manufacturing, trading, and service sectors. Perfect for small vendor expansion.",
    tags: [
      { label: "No Guarantee Needed", color: "bg-secondary-container text-on-secondary-container" },
      { label: "Bank & NBFC Access",  color: "bg-primary-container/20 text-primary" },
    ],
    cta: { label: "Check Eligibility", style: "btn-outlined" },
  },
  {
    id: "esic",
    icon: "health_and_safety",
    title: "ESIC Health Insurance",
    subtitle: "Free medical coverage",
    description: "Employees' State Insurance Corporation provides health insurance and social security to vendors registered under the scheme.",
    tags: [
      { label: "Free OPD",         color: "bg-secondary-container text-on-secondary-container" },
      { label: "Family Coverage",  color: "bg-primary-container/20 text-primary" },
    ],
    cta: { label: "Learn More", style: "btn-outlined" },
  },
];

const PRODUCE = [
  { name: "Tomato (Hybrid)", trend: "up",   trendPct: "+12%", price: "₹45", unit: "kg", prev: "₹40/kg yest.", iconColor: "bg-error-container/40 text-error",    trendColor: "text-error",     trendIcon: "trending_up" },
  { name: "Potato (Local)",  trend: "flat", trendPct: "Stable",price: "₹22",unit: "kg", prev: "₹22/kg yest.", iconColor: "bg-tertiary-container/20 text-tertiary",trendColor: "text-secondary", trendIcon: "trending_flat" },
  { name: "Onion (Nasik)",   trend: "down", trendPct: "-5%",  price: "₹38", unit: "kg", prev: "₹40/kg yest.", iconColor: "bg-primary-container/10 text-primary",  trendColor: "text-secondary", trendIcon: "trending_down" },
  { name: "Mango (Alphonso)",trend: "up",   trendPct: "+8%",  price: "₹180",unit: "kg", prev: "₹166/kg yest.",iconColor: "bg-tertiary-fixed/40 text-tertiary",    trendColor: "text-error",     trendIcon: "trending_up" },
];

function Accordion({ scheme }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-sm md:p-md text-left
                   hover:bg-surface-container-low transition-colors focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-sm">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {scheme.icon}
            </span>
          </div>
          <div>
            <h3 className="font-label-lg text-label-lg text-on-surface">{scheme.title}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{scheme.subtitle}</p>
          </div>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {/* Accordion body */}
      <div className={`accordion-content px-sm md:px-md ${open ? "expanded" : ""}`}>
        <div className="flex flex-col gap-sm border-t border-outline-variant pt-sm">
          <p className="font-body-md text-body-md text-on-surface-variant">{scheme.description}</p>
          <div className="flex flex-wrap gap-xs">
            {scheme.tags.map((t) => (
              <span key={t.label} className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm ${t.color}`}>
                {t.label}
              </span>
            ))}
          </div>
          <button className={`mt-1 w-full py-3 rounded-full font-label-lg text-label-lg active:scale-95 transition-transform ${
            scheme.cta.style === "btn-filled"
              ? "bg-primary text-on-primary shadow-sm hover:shadow-md"
              : "border border-primary text-primary hover:bg-surface-container-low"
          }`}>
            {scheme.cta.label}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchemesScreen() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

      {/* Page title (visible on desktop, hidden on mobile where TopAppBar shows it) */}
      <div className="hidden md:block">
        <h2 className="font-headline-lg text-headline-lg text-on-background">Growth &amp; Insights</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Access government support and track daily market rates.
        </p>
      </div>

      {/* Pro Tip Banner */}
      <div className="relative rounded-xl p-md flex items-start gap-sm shadow-md overflow-hidden bg-primary text-on-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-surface-tint opacity-50 pointer-events-none" />
        <span className="material-symbols-outlined text-secondary-container z-10 flex-shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
        <div className="z-10">
          <h3 className="font-label-lg text-label-lg text-secondary-container mb-1">Pro Tip: PM SVANidhi</h3>
          <p className="font-body-md text-body-md leading-relaxed">
            Repaying your 1st loan on time makes you eligible for a ₹20,000 second loan with no extra paperwork.
          </p>
        </div>
      </div>

      {/* ── Government Schemes ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
            Government Schemes
          </h2>
          <span className="material-symbols-outlined text-primary">account_balance</span>
        </div>
        {SCHEMES.map((s) => <Accordion key={s.id} scheme={s} />)}
      </section>

      {/* ── Market Pricing Helper ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
              Market Pricing Helper
            </h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              Mandi rates near <span className="font-bold text-on-surface">Azadpur</span> · Updated 2h ago
            </p>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center
                             text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        {/* Produce grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRODUCE.map((item) => (
            <div key={item.name} className="md-card p-sm flex items-center justify-between gap-sm anim-fade-up">
              <div className="flex items-center gap-sm">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
                <div>
                  <h3 className="font-label-lg text-label-lg text-on-surface leading-tight">{item.name}</h3>
                  <div className={`flex items-center gap-1 mt-1 ${item.trendColor}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{item.trendIcon}</span>
                    <span className="font-label-sm text-label-sm">{item.trendPct}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-headline-md text-headline-md text-on-surface leading-tight">
                  {item.price}<span className="font-label-sm text-label-sm text-on-surface-variant">/{item.unit}</span>
                </div>
                <div className={`font-label-sm text-label-sm text-outline mt-0.5 ${item.trend !== "flat" ? "line-through" : ""}`}>
                  {item.prev}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-2.5 font-label-lg text-label-lg text-primary text-center
                           rounded-xl hover:bg-surface-container-low transition-colors">
          View All Commodities
        </button>
      </section>

      {/* Bottom spacer for mobile nav */}
      <div className="h-4" />
    </div>
  );
}
