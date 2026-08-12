import { useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

/**
 * Shared sectioning primitives: a violet hero banner, compact progress tiles,
 * a section header with carousel controls and a simple table section.
 */

export function HeroBanner({
  eyebrow,
  title,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  cta?: { label: string; to: string; search?: Record<string, unknown> };
}) {
  return (
    <section className="relative mb-5 overflow-hidden rounded-card bg-dusk-violet px-6 py-7 sm:px-9 sm:py-10">
      {/* soft glow marks, no gradient fill */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-on-violet/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-24 top-4 h-40 w-40 rounded-full bg-on-violet/10 blur-2xl"
      />
      <div className="relative max-w-2xl">
        <p className="text-caption uppercase tracking-[0.22em] text-on-violet/70">{eyebrow}</p>
        <h1 className="mt-3 font-display text-heading-sm font-medium tracking-[-0.03em] text-on-violet sm:text-heading">
          {title}
        </h1>
        {body ? <p className="mt-3 max-w-xl text-body-sm text-on-violet/85">{body}</p> : null}
        {cta ? (
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={cta.to as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search={cta.search as any}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-ink-black transition-colors hover:bg-snow-white/85"
          >
            {cta.label}
            <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-ink-black text-snow-white">
              <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** Horizontal rail of panels, the way a Sana-style board reads. */
export function PanelRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 mb-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
      {children}
    </div>
  );
}

/** A self-contained panel with its own header, scroll body and footer controls. */
export function Panel({
  title,
  subtitle,
  action,
  footer,
  scroll = "vertical",
  width = "md",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  scroll?: "vertical" | "horizontal";
  width?: "md" | "lg";
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function nudge(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    if (scroll === "horizontal") {
      el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
    } else {
      el.scrollBy({ top: direction * Math.round(el.clientHeight * 0.8), behavior: "smooth" });
    }
  }

  return (
    <section
      className={cn(
        "flex shrink-0 snap-start flex-col rounded-card p-5 frost",
        width === "lg" ? "w-[min(560px,88vw)]" : "w-[min(400px,86vw)]",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-display text-body font-medium text-snow-white sm:text-[19px]">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 truncate text-caption text-slate">{subtitle}</p> : null}
        </div>
        {action}
      </div>

      <div
        ref={trackRef}
        className={cn(
          "mt-4 min-h-0 flex-1 [scrollbar-width:thin]",
          scroll === "horizontal"
            ? "-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1"
            : "flex max-h-[420px] flex-col gap-2.5 overflow-y-auto pr-1",
        )}
      >
        {children}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-hairline/20 pt-3.5">
        <p className="min-w-0 truncate text-caption text-slate">{footer}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={`Scroll ${title} back`}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-muted text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={`Scroll ${title} forward`}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-dusk-violet text-on-violet transition-colors hover:bg-dusk-violet/85"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  );
}

/** Row item inside a vertical panel. */
export function PanelItem({
  code,
  title,
  meta,
  to,
  params,
}: {
  code?: string;
  title: string;
  meta?: string;
  to?: string;
  params?: Record<string, string>;
}) {
  const inner = (
    <>
      {code ? (
        <span className="inline-flex items-center rounded-pill bg-muted px-2.5 py-1 text-caption font-medium uppercase tracking-[0.12em] text-bone hairline">
          {code}
        </span>
      ) : null}
      <span className="mt-2 block text-body-sm font-medium text-snow-white">{title}</span>
      {meta ? <span className="mt-1 block truncate text-caption text-slate">{meta}</span> : null}
    </>
  );
  const shell = "block rounded-card-sm bg-muted/40 p-3.5 transition-colors hairline hover:bg-muted";
  if (!to) return <div className={shell}>{inner}</div>;
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className={shell}
    >
      {inner}
    </Link>
  );
}

export function StatTileRow({ children }: { children: ReactNode }) {
  return <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function StatTile({
  icon,
  meta,
  label,
  to,
  params,
  search,
}: {
  icon: ReactNode;
  meta: string;
  label: string;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
}) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card-sm bg-muted text-snow-white">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-caption text-slate">{meta}</span>
        <span className="mt-1 block truncate text-body font-medium text-snow-white">{label}</span>
      </span>
    </>
  );

  const shell = "flex items-center gap-3 rounded-card p-4 frost transition-colors hover:bg-muted";

  if (!to) return <div className={shell}>{inner}</div>;
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search={search as any}
      className={shell}
    >
      {inner}
    </Link>
  );
}

/** Section with a title, optional action link and horizontal carousel arrows. */
export function CarouselSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <section className={cn("mb-7", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-body font-medium text-snow-white sm:text-[19px]">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {action}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} backwards`}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-muted text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} forwards`}
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-dusk-violet text-on-violet transition-colors hover:bg-dusk-violet/85"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
      >
        {children}
      </div>
    </section>
  );
}

/** A table-style section, the way a lesson list reads. */
export function TableSection({
  title,
  columns,
  action,
  children,
}: {
  title: string;
  columns: string[];
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-body font-medium text-snow-white sm:text-[19px]">
          {title}
        </h2>
        {action}
      </div>
      <div className="overflow-x-auto rounded-card frost">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="px-5 py-3.5 text-caption font-medium uppercase tracking-[0.16em] text-slate"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-t border-dashed border-white/10 transition-colors hover:bg-muted/60">
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-4 text-body-sm text-bone", className)}>{children}</td>;
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-muted px-2.5 py-1 text-caption font-medium uppercase tracking-[0.12em] text-bone hairline">
      {children}
    </span>
  );
}
