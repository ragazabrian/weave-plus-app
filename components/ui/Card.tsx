import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  density?: "compact" | "roomy";
  className?: string;
}

/** Bone-white surface, no border, no shadow — depth comes only from the sky-tint → bone-white shift. */
export function Card({ children, density = "roomy", className = "" }: CardProps) {
  const padding = density === "compact" ? "p-5" : "p-8 sm:p-10";
  const radius = density === "compact" ? "rounded-cards-small" : "rounded-cards";
  return (
    <div className={`bg-bone-white ${radius} ${padding} ${className}`}>{children}</div>
  );
}
