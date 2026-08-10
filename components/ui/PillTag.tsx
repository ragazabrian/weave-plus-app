import type { PastelWash, Severity } from "@/lib/types";

const washClass: Record<PastelWash, string> = {
  lavender: "bg-lavender-wash",
  mint: "bg-mint-wash",
  powder: "bg-powder-blue",
  solar: "bg-solar-wash",
};

export function PillTag({ wash, label }: { wash: PastelWash; label: string }) {
  return (
    <span className={`${washClass[wash]} rounded-tags px-3 py-1 text-body-sm font-medium text-ink inline-block`}>
      {label}
    </span>
  );
}

const severityDot: Record<Severity, string> = {
  p0: "bg-red-500",
  p1: "bg-amber-500",
  p2: "bg-iris-blue",
};

const severityWash: Record<Severity, PastelWash> = {
  p0: "solar",
  p1: "solar",
  p2: "powder",
};

const severityLabel: Record<Severity, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
};

/** Severity carries meaning through the dot color, not the pastel wash — washes alone aren't distinct enough to stay legible. */
export function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <span className={`${washClass[severityWash[severity]]} rounded-tags px-3 py-1 text-body-sm font-medium text-ink inline-flex items-center gap-2`}>
      <span className={`size-2 rounded-full ${severityDot[severity]}`} aria-hidden />
      {severityLabel[severity]}
    </span>
  );
}
