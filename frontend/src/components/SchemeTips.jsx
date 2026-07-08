/**
 * SchemeTips.jsx — Screen 6: accordion/tabs for government scheme eligibility
 * and pricing guidance.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, TrendingUp } from "lucide-react";
import MarkdownBlock from "./MarkdownBlock";

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-sand rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface
                   text-left font-medium text-charcoal hover:bg-sand transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-teal" />
          {title}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-slate" />
        ) : (
          <ChevronDown size={16} className="text-slate" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 bg-surface border-t border-sand">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SchemeTips({ policyContent, marketContent }) {
  return (
    <div className="space-y-3">
      <AccordionItem
        title="Government Schemes & Registration"
        icon={BookOpen}
        defaultOpen
      >
        <MarkdownBlock content={policyContent} />
      </AccordionItem>

      <AccordionItem title="Pricing & Market Insights" icon={TrendingUp}>
        <MarkdownBlock content={marketContent} />
      </AccordionItem>
    </div>
  );
}
