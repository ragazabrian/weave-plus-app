import type { ReactNode } from "react";
import type { PastelWash } from "@/lib/types";

const washClass: Record<PastelWash, string> = {
  lavender: "bg-lavender-wash",
  mint: "bg-mint-wash",
  powder: "bg-powder-blue",
  solar: "bg-solar-wash",
};

interface PastelTileProps {
  wash: PastelWash;
  children: ReactNode;
  className?: string;
}

export function PastelTile({ wash, children, className = "" }: PastelTileProps) {
  return (
    <div className={`${washClass[wash]} rounded-cards p-6 ${className}`}>{children}</div>
  );
}
