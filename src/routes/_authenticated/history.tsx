import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { useHistory } from "@/lib/history-store";
import { Card, EmptyState, GhostButton, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History | weave+" },
      {
        name: "description",
        content: "Recently visited pages across courses, notes, canvases and the calendar.",
      },
      { property: "og:title", content: "History | weave+" },
      {
        property: "og:description",
        content: "Jump back to any page you opened recently in weave+.",
      },
    ],
  }),
  component: HistoryPage,
});

function groupLabel(at: number) {
  const day = new Date(at);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return "Today";
  if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
  return day.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function HistoryPage() {
  const { visits, clear } = useHistory();

  const groups = visits.reduce<Record<string, typeof visits>>((acc, visit) => {
    const key = groupLabel(visit.at);
    acc[key] = [...(acc[key] ?? []), visit];
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="History"
        description="The last pages you opened on this device, newest first."
        action={
          visits.length > 0 ? (
            <GhostButton onClick={clear}>
              <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
              Clear history
            </GhostButton>
          ) : undefined
        }
      />
      {visits.length === 0 ? (
        <EmptyState>Nothing here yet. Open a course or note and it shows up.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groups).map(([label, entries]) => (
            <Card key={label}>
              <h2 className="mb-4 flex items-center gap-2 text-body font-medium text-snow-white">
                <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={1.6} />
                {label}
              </h2>
              <div className="flex flex-col gap-2">
                {entries.map((visit) => (
                  <Link
                    key={`${visit.path}-${visit.at}`}
                    to={visit.path as "/dashboard"}
                    className="grid gap-1 rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                  >
                    <span className="truncate text-body-sm font-medium text-snow-white">
                      {visit.label}
                    </span>
                    <span className="truncate text-caption text-slate">
                      {new Date(visit.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {visit.path}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
