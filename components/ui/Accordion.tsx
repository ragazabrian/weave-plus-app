"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, subtitle, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-bone-white rounded-cards p-6 sm:p-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
        aria-expanded={open}
      >
        <div>
          <div className="text-subheading font-medium text-ink font-geist">{title}</div>
          {subtitle && <div className="text-body-sm text-fog mt-1">{subtitle}</div>}
        </div>
        <span className={`text-graphite transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden>
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[650ms] ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pt-4 text-body text-fog">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
