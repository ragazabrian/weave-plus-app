import { createFileRoute } from "@tanstack/react-router";
import { createLocalStore } from "@/lib/local-store";
import { Card, PageHeader } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | weave+" },
      {
        name: "description",
        content:
          "Choose which course activity reaches you: announcements, grades, deadlines, discussions and inbox replies.",
      },
      { property: "og:title", content: "Notifications | weave+" },
      {
        property: "og:description",
        content: "Per channel notification preferences for announcements, grading and deadlines.",
      },
    ],
  }),
  component: NotificationsPage,
});

type Prefs = Record<string, "instant" | "daily" | "off">;

const CHANNELS = [
  { id: "announcements", label: "Announcements", hint: "New posts in any course you can see." },
  { id: "grading", label: "Grading", hint: "A submission is graded or returned." },
  { id: "deadlines", label: "Upcoming deadlines", hint: "Assignments due in the next 48 hours." },
  { id: "discussions", label: "Discussions", hint: "Replies in course discussions you joined." },
  { id: "inbox", label: "Inbox", hint: "Direct conversations and lecturer replies." },
  { id: "agent", label: "Agent runs", hint: "The agent finishes a long running task." },
];

const DEFAULTS: Prefs = {
  announcements: "instant",
  grading: "instant",
  deadlines: "daily",
  discussions: "daily",
  inbox: "instant",
  agent: "off",
};

const store = createLocalStore<Prefs>(
  "weave-notification-prefs",
  (raw) => {
    if (!raw) return DEFAULTS;
    try {
      return { ...DEFAULTS, ...(JSON.parse(raw) as Prefs) };
    } catch {
      return DEFAULTS;
    }
  },
  (value) => JSON.stringify(value),
);

const MODES = ["instant", "daily", "off"] as const;

function NotificationsPage() {
  const prefs = store.useStore();

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Pick a cadence per channel. Instant sends as it happens, daily batches into one digest."
      />
      <Card className="flex flex-col gap-2">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            className="grid grid-cols-1 items-center gap-3 rounded-card-sm bg-muted p-4 hairline sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-snow-white">{channel.label}</p>
              <p className="mt-0.5 text-caption text-slate">{channel.hint}</p>
            </div>
            <div className="flex rounded-pill bg-graphite-surface p-1 hairline">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => store.set({ ...prefs, [channel.id]: mode })}
                  aria-pressed={prefs[channel.id] === mode}
                  className={cn(
                    "min-h-9 rounded-pill px-3 text-caption font-medium capitalize transition-colors",
                    prefs[channel.id] === mode
                      ? "bg-snow-white text-graphite-surface"
                      : "text-bone hover:text-snow-white",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
