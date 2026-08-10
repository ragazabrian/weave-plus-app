import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** Only one primary button per view — it's the only place dense charcoal weight belongs. */
export function PrimaryButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`bg-charcoal text-paper-white rounded-buttons px-8 py-3 text-body font-medium font-geist shadow-button cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`bg-charcoal text-paper-white rounded-cards-small px-4 py-2 text-body-sm font-medium font-geist cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`text-graphite hover:text-ink rounded-cards-small px-4 py-2 text-body-sm font-medium font-geist cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
