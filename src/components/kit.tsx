import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card , graphite panel with a hairline edge. Depth comes from translucency, never shadow. */
export function Card({
  children,
  className,
  dense,
  accent,
}: {
  children: ReactNode;
  className?: string;
  dense?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        dense ? "rounded-card-sm p-5" : "rounded-card p-7",
        accent ? "accent-outline" : "bg-graphite-surface hairline",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The only filled button in the system: white pill, graphite text. */
export function FilledButton({
  children,
  className,
  compact,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { compact?: boolean }) {
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      style={{
        color: rest.disabled ? "var(--p-void-canvas)" : "var(--p-graphite-surface)",
        ...rest.style,
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-button bg-snow-white font-medium transition-colors",
        "hover:bg-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk-violet",
        "disabled:cursor-not-allowed disabled:bg-slate",
        compact ? "min-h-11 px-5 py-2 text-body-sm" : "min-h-12 px-6 py-3 text-body",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Hairline ghost button: transparent fill, readable label in both themes. */
export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={rest.type ?? "button"}
      {...rest}
      style={{ color: rest.disabled ? "var(--p-slate)" : "var(--p-bone)", ...rest.style }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-ui bg-muted px-4 py-2 text-body-sm font-medium transition-colors hairline",
        "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dusk-violet",
        "disabled:cursor-not-allowed disabled:hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "mist",
  className,
}: {
  children: ReactNode;
  tone?: "mist" | "lavender" | "mint" | "powder" | "solar";
  className?: string;
}) {
  const tones: Record<string, string> = {
    mist: "bg-muted text-bone hairline",
    lavender: "bg-snow-white text-graphite-surface",
    mint: "text-bone hairline",
    powder: "text-smoke hairline",
    solar: "wash-violet text-snow-white",
  };
  return (
    <span className={cn("rounded-pill px-3 py-1 text-caption font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-card frost p-7">
      <p className="text-caption uppercase tracking-wide text-slate">{label}</p>
      <p className="mt-3 font-display text-heading-sm font-medium text-snow-white">{value}</p>
      {hint ? <p className="mt-1 text-body-sm text-ash">{hint}</p> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-geist text-heading-sm font-medium text-bone">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-body text-ash">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-heading font-medium tracking-[-0.035em] text-snow-white">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-body-lg text-ash">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export const categoryTone: Record<string, "lavender" | "mint" | "powder" | "solar"> = {
  lavender: "lavender",
  mint: "mint",
  powder: "powder",
  solar: "solar",
};

export const categoryBg: Record<string, string> = {
  lavender: "bg-lavender-wash",
  mint: "bg-mint-wash",
  powder: "bg-powder-blue",
  solar: "bg-solar-wash",
};

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-card frost p-7 text-body text-slate">{children}</div>;
}
