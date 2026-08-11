import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  MoreHorizontalIcon,
  FileEditIcon,
  Edit02Icon,
  PlusSignCircleIcon,
  Copy01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { PageHeader, Pill } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings | weave+" },
      {
        name: "description",
        content:
          "Every weave+ meeting and event in one place: attendance, conferencing links and calendar actions.",
      },
      { property: "og:title", content: "Meetings | weave+" },
      {
        property: "og:description",
        content: "Track course meetings and events, attendance and conferencing links.",
      },
    ],
  }),
  component: MeetingsPage,
});

type Entry = {
  id: string;
  title: string;
  date: string;
  time: string;
  people: string[];
  extra: number;
  platform: "Zoom" | "Google Meet";
  tag?: string;
};

const MEETINGS: Entry[] = [
  {
    id: "m1",
    title: "UX Design Sync: Token Transfer Flow Improvements",
    date: "Thursday, April 17, 2026",
    time: "2:00 PM to 3:00 PM (PHT)",
    people: ["AL", "MR", "JT"],
    extra: 4,
    platform: "Zoom",
    tag: "Design",
  },
  {
    id: "m2",
    title: "Quarterly Programme Review and Curriculum Alignment",
    date: "Friday, April 18, 2026",
    time: "1:00 PM to 1:45 PM (PHT)",
    people: ["BR", "KC", "DV"],
    extra: 2,
    platform: "Google Meet",
    tag: "Faculty",
  },
  {
    id: "m3",
    title: "Partnership Strategy Sync: Collaboration Alignment Call",
    date: "Friday, April 18, 2026",
    time: "2:00 PM to 3:00 PM (PHT)",
    people: ["SM", "PA", "LO"],
    extra: 8,
    platform: "Google Meet",
    tag: "Partnership",
  },
  {
    id: "m4",
    title: "Weekly Course Oversight and Delivery Coordination",
    date: "Monday, April 21, 2026",
    time: "12:00 PM to 1:00 PM (PHT)",
    people: ["BR", "TN", "GM"],
    extra: 6,
    platform: "Zoom",
    tag: "Operations",
  },
];

const EVENTS: Entry[] = [
  {
    id: "e1",
    title: "Capstone Showcase: Second Brain Cohort",
    date: "Wednesday, April 23, 2026",
    time: "9:00 AM to 12:00 PM (PHT)",
    people: ["BR", "AL", "KC"],
    extra: 21,
    platform: "Google Meet",
    tag: "Showcase",
  },
  {
    id: "e2",
    title: "Open Lab: Vault and Graph Workshop",
    date: "Thursday, April 24, 2026",
    time: "3:00 PM to 4:30 PM (PHT)",
    people: ["MR", "DV"],
    extra: 12,
    platform: "Zoom",
    tag: "Workshop",
  },
];

const ACTIONS = [
  { label: "View full meeting details", icon: FileEditIcon },
  { label: "Indicate my attendance", icon: Edit02Icon },
  { label: "Add to the Calendar", icon: PlusSignCircleIcon },
  { label: "Copy meeting details", icon: Copy01Icon },
] as const;

function EntryCard({ entry }: { entry: Entry }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative flex h-full flex-col rounded-card bg-graphite-surface p-5 hairline">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-body font-medium text-snow-white">{entry.title}</h3>
        <div className="relative shrink-0" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={`Actions for ${entry.title}`}
            aria-expanded={open}
            className="rounded-ui p-1.5 text-slate transition-colors hover:bg-muted hover:text-snow-white"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.8} />
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1.5 w-[248px] overflow-hidden rounded-card-sm bg-graphite-surface p-1.5 hairline"
            >
              {ACTIONS.map((action) => (
                <button
                  key={action.label}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    toast.success(action.label);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-ui px-2.5 py-2 text-left text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
                >
                  <HugeiconsIcon icon={action.icon} size={16} strokeWidth={1.6} />
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-body-sm text-smoke">
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.6} className="text-slate" />
          {entry.date}
        </span>
        <span className="flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={1.6} className="text-slate" />
          {entry.time}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex items-center">
          {entry.people.map((initials, index) => (
            <span
              key={initials}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-pill bg-blurple text-caption font-medium text-on-violet ring-2 ring-graphite-surface",
                index > 0 && "-ml-2",
              )}
            >
              {initials}
            </span>
          ))}
        </div>
        <span className="rounded-pill bg-muted px-2 py-0.5 text-caption text-smoke hairline">
          +{entry.extra}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="flex items-center gap-2 text-body-sm text-bone">
          <span className="flex h-6 w-6 items-center justify-center rounded-ui bg-blurple/15 text-blurple">
            <HugeiconsIcon icon={Video01Icon} size={14} strokeWidth={1.8} />
          </span>
          {entry.platform}
        </span>
        {entry.tag ? <Pill tone="lavender">{entry.tag}</Pill> : null}
      </div>
    </div>
  );
}

function MeetingsPage() {
  const [tab, setTab] = useState<"meetings" | "events">("meetings");
  const list = tab === "meetings" ? MEETINGS : EVENTS;

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="Course syncs, faculty reviews and events, with attendance and conferencing in one view."
      />

      <div
        role="tablist"
        aria-label="Meetings and events"
        className="mb-5 inline-flex rounded-pill bg-muted p-1 hairline"
      >
        {(["meetings", "events"] as const).map((option) => (
          <button
            key={option}
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={cn(
              "min-h-9 rounded-pill px-6 text-body-sm font-medium capitalize transition-colors",
              tab === option ? "bg-blurple text-on-violet" : "text-smoke hover:text-snow-white",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
