import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Note01Icon,
  SparklesIcon,
  Search01Icon,
  Tick02Icon,
  ArrowDown01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * Coded replicas of the real workspace screens, used as landing-page
 * illustrations. Layout, tokens and copy mirror the shipped routes so the
 * marketing page never shows something the product cannot do.
 */

function Frame({
  crumb,
  children,
  className,
}: {
  crumb: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card-sm bg-graphite-surface text-left hairline",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span className="ml-2 truncate text-caption text-slate">{crumb}</span>
      </div>
      {children}
    </div>
  );
}

/** Notes vault: folder rail, note list, backlink footer. */
export function VaultMock() {
  return (
    <Frame crumb="weave+ / notes">
      <div className="grid sm:grid-cols-[124px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-0.5 border-r border-border p-2.5 sm:flex">
          {["All notes", "Modules", "Seminar", "Reading"].map((folder, i) => (
            <span
              key={folder}
              className={cn(
                "rounded-ui px-2 py-1.5 text-caption font-medium",
                i === 1 ? "bg-accent text-snow-white" : "text-smoke",
              )}
            >
              {folder}
            </span>
          ))}
          <div className="mt-3 flex flex-wrap gap-1 px-1">
            {["#rubric", "#imd201"].map((tag) => (
              <span key={tag} className="rounded-pill px-2 py-0.5 text-caption text-slate hairline">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 p-3">
          <div className="flex items-center gap-2 rounded-ui bg-muted px-2.5 py-1.5">
            <HugeiconsIcon
              icon={Search01Icon}
              size={13}
              strokeWidth={1.6}
              className="shrink-0 text-slate"
            />
            <span className="truncate text-caption text-slate">Search the vault</span>
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {[
              { t: "assessment-rubric.md", m: "4 backlinks · 2h ago" },
              { t: "week-04-critique.md", m: "7 backlinks · yesterday" },
              { t: "typographic-systems.md", m: "2 backlinks · 3d ago" },
              { t: "critique-board", m: "canvas · 5 shapes" },
            ].map((row) => (
              <div
                key={row.t}
                className="flex min-w-0 items-center justify-between gap-3 rounded-card-sm px-2.5 py-2 hairline"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <HugeiconsIcon
                    icon={Note01Icon}
                    size={13}
                    strokeWidth={1.6}
                    className="shrink-0 text-slate"
                  />
                  <span className="truncate text-caption text-bone">{row.t}</span>
                </span>
                <span className="shrink-0 text-caption text-slate">{row.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Course detail: module accordion plus grading queue. */
export function CourseMock() {
  return (
    <Frame crumb="weave+ / courses / IMD-201">
      <div className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {["Home", "Modules", "Assignments", "Gradebook"].map((tab, i) => (
            <span
              key={tab}
              className={cn(
                "rounded-pill px-2.5 py-1 text-caption font-medium",
                i === 1 ? "bg-snow-white text-graphite-surface" : "text-smoke hairline",
              )}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {[
            { t: "Module 3 · Type systems", m: "6 items", open: true },
            { t: "Module 4 · Critique method", m: "4 items", open: false },
            { t: "Module 5 · Final brief", m: "draft", open: false },
          ].map((row) => (
            <div key={row.t} className="rounded-card-sm px-2.5 py-2 hairline">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-caption font-medium text-bone">{row.t}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-caption text-slate">
                  {row.m}
                  <HugeiconsIcon icon={ArrowDown01Icon} size={13} strokeWidth={1.6} />
                </span>
              </div>
              {row.open ? (
                <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
                  {["Reading · Grid anatomy", "Note · assessment-rubric.md"].map((item) => (
                    <span key={item} className="truncate text-caption text-slate">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
          <div className="rounded-card-sm p-2.5 hairline">
            <p className="text-caption uppercase tracking-wide text-slate">Awaiting grading</p>
            <p className="mt-1 font-display text-body-lg font-medium text-snow-white">12</p>
          </div>
          <div className="rounded-card-sm p-2.5 hairline">
            <p className="text-caption uppercase tracking-wide text-slate">Cohort completion</p>
            <p className="mt-1 font-display text-body-lg font-medium text-snow-white">78%</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Agent chat, exactly as the workspace renders it. */
export function AgentMock() {
  return (
    <Frame crumb="weave+ / agent">
      <div className="flex flex-col gap-2 p-3">
        <div className="ml-auto max-w-[80%] rounded-card-sm bg-muted px-3 py-2">
          <p className="text-caption text-bone">What needs me in IMD-201 today?</p>
        </div>
        <div className="max-w-[88%] rounded-card-sm p-3 hairline">
          <span className="flex items-center gap-1.5 text-caption text-slate">
            <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={1.6} />
            weave+ agent
          </span>
          <p className="mt-2 text-caption text-bone">
            Three things. Twelve submissions are unmarked and the oldest has waited three days.
            Module 5 is still a draft and the cohort reaches it Thursday. Drop-off on the reading is
            21 percent.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {["assessment-rubric.md", "Assignment 3", "Gradebook"].map((cite) => (
              <span
                key={cite}
                className="rounded-pill px-2 py-0.5 text-caption text-slate hairline"
              >
                {cite}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-pill bg-muted px-3 py-2">
          <span className="flex-1 truncate text-caption text-slate">
            Ask across everything you can see
          </span>
          <span className="rounded-pill bg-snow-white px-2.5 py-0.5 text-caption font-medium text-graphite-surface">
            Send
          </span>
        </div>
      </div>
    </Frame>
  );
}

/** Interactive graph view, as a static snapshot of the real force layout. */
export function GraphMock() {
  const hub = { x: 92, y: 54, r: 9 };
  const nodes = [
    hub,
    { x: 40, y: 30, r: 5 },
    { x: 150, y: 32, r: 6 },
    { x: 34, y: 86, r: 6 },
    { x: 146, y: 92, r: 5 },
    { x: 92, y: 108, r: 4 },
    { x: 118, y: 20, r: 4 },
  ];

  return (
    <Frame crumb="weave+ / notes / graph">
      <div className="p-3">
        <svg viewBox="0 0 184 128" className="h-32 w-full">
          {nodes.slice(1).map((n, i) => (
            <line
              key={i}
              x1={hub.x}
              y1={hub.y}
              x2={n.x}
              y2={n.y}
              stroke="var(--p-slate)"
              strokeWidth="0.7"
              opacity="0.6"
            />
          ))}

          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={i === 0 ? "var(--p-dusk-violet)" : "var(--p-smoke)"}
            />
          ))}
        </svg>
        <p className="mt-2 text-caption text-slate">248 notes · 612 links</p>
      </div>
    </Frame>
  );
}

/** Gradebook table. */
export function GradebookMock() {
  return (
    <Frame crumb="weave+ / courses / gradebook">
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2 text-caption uppercase tracking-wide text-slate">
          <span>Student</span>
          <span>A3</span>
        </div>
        <div className="mt-1.5 flex flex-col">
          {[
            { n: "Priya Raman", g: "88" },
            { n: "Tom Whitaker", g: "74" },
            { n: "Ada Nwosu", g: "Ungraded" },
            { n: "Luis Ferrer", g: "91" },
          ].map((row) => (
            <div
              key={row.n}
              className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-2">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  size={13}
                  strokeWidth={1.6}
                  className="shrink-0 text-slate"
                />
                <span className="truncate text-caption text-bone">{row.n}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-caption",
                  row.g === "Ungraded" ? "text-slate" : "text-snow-white",
                )}
              >
                {row.g}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** Merged calendar of deadlines. */
export function CalendarMock() {
  return (
    <Frame crumb="weave+ / calendar">
      <div className="p-3">
        <div className="flex flex-col gap-1.5">
          {[
            { d: "Mon", t: "Assignment 3 due", c: "IMD-201", done: false },
            { d: "Tue", t: "Seminar critique", c: "IMD-201", done: true },
            { d: "Thu", t: "Module 5 opens", c: "IMD-201", done: false },
            { d: "Fri", t: "Grading window closes", c: "IMD-118", done: false },
          ].map((row) => (
            <div
              key={row.t}
              className="flex min-w-0 items-center gap-2.5 rounded-card-sm px-2.5 py-2 hairline"
            >
              <span className="w-7 shrink-0 text-caption text-slate">{row.d}</span>
              <HugeiconsIcon
                icon={row.done ? Tick02Icon : Calendar03Icon}
                size={13}
                strokeWidth={1.6}
                className={cn("shrink-0", row.done ? "text-dusk-violet" : "text-slate")}
              />
              <span className="min-w-0 flex-1 truncate text-caption text-bone">{row.t}</span>
              <span className="shrink-0 text-caption text-slate">{row.c}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
