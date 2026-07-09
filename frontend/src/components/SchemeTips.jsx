/**
 * SchemeTips.jsx — Screen 6: accordion/tabs for government scheme eligibility
 * and pricing guidance.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-sand rounded-xl overflow-hidden transition-all duration-200 shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface
                   text-left font-medium text-charcoal hover:bg-sand transition-colors active:bg-sand/75"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-teal" />
          {title}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-slate animate-in fade-in zoom-in-75" />
        ) : (
          <ChevronDown size={16} className="text-slate animate-in fade-in zoom-in-75" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 bg-surface border-t border-sand animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SchemeTips({ policyContent, marketContent }) {
  const policyError = !policyContent || policyContent.trim() === "" || policyContent.includes("[Error:");
  const marketError = !marketContent || marketContent.trim() === "" || marketContent.includes("[Error:");

  return (
    <div className="space-y-3">
      <AccordionItem
        title="Government Schemes & Registration"
        icon={BookOpen}
        defaultOpen
      >
        {policyError ? (
          <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Scheme Information Unavailable</p>
              <p className="text-xs opacity-90 mt-0.5">
                The policy agent was unable to load government schemes. You can still read the pricing insights below.
              </p>
            </div>
          </div>
        ) : (
          <MarkdownBlock content={policyContent} />
        )}
      </AccordionItem>

      <AccordionItem title="Pricing & Market Insights" icon={TrendingUp}>
        {marketError ? (
          <div className="bg-error/5 text-error rounded-xl p-4 text-sm border border-error/20 flex gap-2.5 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pricing Insights Unavailable</p>
              <p className="text-xs opacity-90 mt-0.5">
                The market insights agent was unable to load pricing advice at this moment.
              </p>
            </div>
          </div>
        ) : (
          <MarkdownBlock content={marketContent} />
        )}
      </AccordionItem>
    </div>
  );
}
