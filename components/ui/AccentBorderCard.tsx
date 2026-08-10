import type { ReactNode } from "react";

/** Never more than one per screen — reserved for a single highlighted item, e.g. "recommended module" or "next up." */
export function AccentBorderCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-cards p-[3px]" style={{ background: "var(--gradient-iris)" }}>
      <div className="bg-bone-white rounded-cards p-8">{children}</div>
    </div>
  );
}
