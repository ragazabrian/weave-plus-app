import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, PageHeader } from "@/components/kit";
import { courseHex } from "@/lib/course-color";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar | weave+" },
      {
        name: "description",
        content:
          "A monday-style calendar widget: month, week and agenda views of every deadline and announcement across your courses.",
      },
      { property: "og:title", content: "Calendar | weave+" },
      {
        property: "og:description",
        content:
          "Month, week and agenda views with course colour coding, filters and unscheduled items.",
      },
    ],
  }),
  component: CalendarPage,
});

type ViewMode = "month" | "week" | "agenda" | "kanban" | "list" | "timeline";

type CalItem = {
  id: string;
  title: string;
  date: Date | null;
  courseId: string;
  kind: "assignment" | "announcement";
};

/** Stable colour per course, mirroring monday's "colour by board" behaviour. */
const SWATCHES = [
  "#6b62f2",
  "#3aa9ff",
  "#28c76f",
  "#ffb020",
  "#ff6b8a",
  "#00c4b4",
  "#a06bf2",
  "#ff8a3d",
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
/** Monday-first week start. */
function startOfWeek(d: Date) {
  const c = startOfDay(d);
  const day = (c.getDay() + 6) % 7;
  return addDays(c, -day);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [showWeekends, setShowWeekends] = useState(true);
  const [hiddenCourses, setHiddenCourses] = useState<string[]>([]);
  const [kinds, setKinds] = useState<CalItem["kind"][]>(["assignment", "announcement"]);
  const [selected, setSelected] = useState<Date | null>(null);

  const data = useQuery({
    queryKey: ["calendar-widget"],
    queryFn: async () => {
      const [assignments, announcements, courses] = await Promise.all([
        supabase.from("assignments").select("id, title, due_at, course_id"),
        supabase.from("announcements").select("id, title, created_at, course_id"),
        supabase.from("courses").select("id, code, title, category, color"),
      ]);
      return {
        assignments: assignments.data ?? [],
        announcements: announcements.data ?? [],
        courses: courses.data ?? [],
      };
    },
  });

  const courses = data.data?.courses ?? [];
  /** Course colour, taken from the course itself, with a stable fallback. */
  const colourOf = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) return courseHex(course);
    const index = Math.max(
      0,
      courses.findIndex((c) => c.id === courseId),
    );
    return SWATCHES[index % SWATCHES.length] ?? SWATCHES[0]!;
  };
  const codeOf = (courseId: string) => courses.find((c) => c.id === courseId)?.code ?? "No course";

  const items: CalItem[] = useMemo(() => {
    const source: CalItem[] = [
      ...(data.data?.assignments ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        date: a.due_at ? new Date(a.due_at) : null,
        courseId: a.course_id,
        kind: "assignment" as const,
      })),
      ...(data.data?.announcements ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        date: a.created_at ? new Date(a.created_at) : null,
        courseId: a.course_id,
        kind: "announcement" as const,
      })),
    ];
    return source
      .filter((i) => kinds.includes(i.kind))
      .filter((i) => !hiddenCourses.includes(i.courseId))
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  }, [data.data, kinds, hiddenCourses]);

  const scheduled = items.filter((i) => i.date);
  const unscheduled = items.filter((i) => !i.date);
  const itemsOn = (day: Date) => scheduled.filter((i) => sameDay(i.date!, day));

  const visibleDays = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor, view]);

  const columns = showWeekends ? 7 : 5;
  const gridDays = showWeekends
    ? visibleDays
    : visibleDays.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

  function shift(direction: 1 | -1) {
    if (view === "week") return setCursor((c) => addDays(c, direction * 7));
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + direction, 1));
  }

  function toggle<T>(list: T[], value: T, set: (next: T[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const agendaItems = scheduled.filter((i) => i.date! >= startOfDay(new Date()));
  const pastItems = scheduled.filter((i) => i.date! < startOfDay(new Date())).reverse();

  const rangeLabel =
    view === "week"
      ? `${startOfWeek(cursor).toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${addDays(startOfWeek(cursor), 6).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
      : view === "agenda" || view === "kanban" || view === "list"
        ? "All items"
        : monthLabel(cursor);

  function ItemChip({ item, compact }: { item: CalItem; compact?: boolean }) {
    const body = (
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: colourOf(item.courseId) }}
        />
        <span className="truncate">{item.title}</span>
      </span>
    );
    const className = cn(
      "block w-full rounded-card-sm bg-muted px-2 py-1 text-left text-caption text-bone transition-colors hairline hover:bg-accent hover:text-snow-white",
      compact && "px-1.5",
    );
    if (item.kind === "assignment") {
      return (
        <Link
          to="/courses/$courseId/assignments/$assignmentId"
          params={{ courseId: item.courseId, assignmentId: item.id }}
          className={className}
          title={`${item.title} · ${codeOf(item.courseId)}`}
        >
          {body}
        </Link>
      );
    }
    return (
      <Link
        to="/courses/$courseId/announcements"
        params={{ courseId: item.courseId }}
        className={className}
        title={`${item.title} · ${codeOf(item.courseId)}`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Deadlines and announcements from every course you can see, in one widget. Switch views, filter courses and colour code by course."
      />

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card p-3 frost">
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-muted text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.6} />
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-muted text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
          </button>
          <button
            onClick={() => setCursor(startOfDay(new Date()))}
            className="ml-1 min-h-9 rounded-pill bg-muted px-3 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            Today
          </button>
        </div>

        <p className="ml-1 flex items-center gap-2 text-body-sm font-medium text-snow-white">
          <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.6} />
          {rangeLabel}
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-pill bg-muted p-1 hairline">
            {(["month", "week", "agenda", "kanban", "list", "timeline"] as ViewMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={cn(
                    "min-h-8 rounded-pill px-3 text-caption font-medium capitalize transition-colors",
                    view === mode
                      ? "bg-snow-white text-graphite-surface"
                      : "text-bone hover:text-snow-white",
                  )}
                >
                  {mode}
                </button>
              ),
            )}
          </div>
          {view === "month" || view === "week" ? (
            <button
              onClick={() => setShowWeekends((v) => !v)}
              className="min-h-9 rounded-pill bg-muted px-3 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
            >
              {showWeekends ? "Hide weekends" : "Show weekends"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card p-3 frost">
        <span className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-slate">
          <HugeiconsIcon icon={FilterIcon} size={14} strokeWidth={1.6} />
          Filters
        </span>
        {(["assignment", "announcement"] as CalItem["kind"][]).map((kind) => (
          <button
            key={kind}
            onClick={() => toggle(kinds, kind, setKinds)}
            className={cn(
              "min-h-8 rounded-pill px-3 text-caption font-medium capitalize transition-colors hairline",
              kinds.includes(kind)
                ? "bg-snow-white text-graphite-surface"
                : "bg-muted text-slate hover:text-snow-white",
            )}
          >
            {kind}s
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        {courses.map((course) => {
          const on = !hiddenCourses.includes(course.id);
          return (
            <button
              key={course.id}
              onClick={() => toggle(hiddenCourses, course.id, setHiddenCourses)}
              className={cn(
                "flex min-h-8 items-center gap-1.5 rounded-pill px-3 text-caption font-medium transition-colors hairline",
                on
                  ? "bg-muted text-snow-white"
                  : "bg-muted text-slate opacity-60 hover:opacity-100",
              )}
              title={course.title}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colourOf(course.id) }}
              />
              {course.code}
            </button>
          );
        })}
      </div>

      {data.isLoading ? (
        <EmptyState>Loading your calendar…</EmptyState>
      ) : view === "agenda" ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <section className="rounded-card p-5 frost">
            <h2 className="mb-3 text-body font-medium text-snow-white">Upcoming</h2>
            <div className="flex flex-col gap-2">
              {agendaItems.length === 0 ? (
                <EmptyState>Nothing scheduled ahead.</EmptyState>
              ) : (
                agendaItems.map((item) => (
                  <div key={`${item.kind}-${item.id}`}>
                    <p className="mb-1 text-caption text-slate">
                      {item.date!.toLocaleString()} · {codeOf(item.courseId)}
                    </p>
                    <ItemChip item={item} />
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-card p-5 frost">
            <h2 className="mb-3 text-body font-medium text-snow-white">Past</h2>
            <div className="flex flex-col gap-2">
              {pastItems.length === 0 ? (
                <EmptyState>Nothing behind you.</EmptyState>
              ) : (
                pastItems.map((item) => (
                  <div key={`${item.kind}-${item.id}`}>
                    <p className="mb-1 text-caption text-slate">
                      {item.date!.toLocaleString()} · {codeOf(item.courseId)}
                    </p>
                    <ItemChip item={item} />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : view === "kanban" ? (
        <KanbanView items={items} codeOf={codeOf} renderChip={(item) => <ItemChip item={item} />} />
      ) : view === "list" ? (
        <ListView items={items} codeOf={codeOf} colourOf={colourOf} />
      ) : view === "timeline" ? (
        <TimelineView cursor={cursor} courses={courses} items={scheduled} colourOf={colourOf} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-card p-3 frost sm:p-4">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
            >
              {DAY_LABELS.filter((_, i) => (showWeekends ? true : i < 5)).map((label) => (
                <p
                  key={label}
                  className="px-1 pb-2 text-caption uppercase tracking-wide text-slate"
                >
                  {label}
                </p>
              ))}
              {gridDays.map((day) => {
                const dayItems = itemsOn(day);
                const isToday = sameDay(day, new Date());
                const outside = view === "month" && day.getMonth() !== cursor.getMonth();
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelected(day)}
                    className={cn(
                      "flex min-h-24 flex-col gap-1 rounded-card-sm bg-muted p-2 text-left align-top transition-colors hairline hover:bg-accent",
                      view === "week" && "min-h-56",
                      outside && "opacity-45",
                      selected && sameDay(selected, day) && "bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "text-caption font-medium",
                        isToday
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-snow-white text-graphite-surface"
                          : "text-slate",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayItems.slice(0, view === "week" ? 8 : 3).map((item) => (
                      <ItemChip key={`${item.kind}-${item.id}`} item={item} compact />
                    ))}
                    {dayItems.length > (view === "week" ? 8 : 3) ? (
                      <span className="px-1 text-caption text-slate">
                        +{dayItems.length - (view === "week" ? 8 : 3)} more
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-card p-5 frost">
              <h2 className="text-body font-medium text-snow-white">
                {selected
                  ? selected.toLocaleDateString(undefined, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "Pick a day"}
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {!selected ? (
                  <p className="text-body-sm text-slate">
                    Select a day to see everything scheduled on it.
                  </p>
                ) : itemsOn(selected).length === 0 ? (
                  <EmptyState>Nothing on this day.</EmptyState>
                ) : (
                  itemsOn(selected).map((item) => (
                    <div key={`${item.kind}-${item.id}`}>
                      <p className="mb-1 text-caption text-slate">
                        {item.date!.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {codeOf(item.courseId)} · {item.kind}
                      </p>
                      <ItemChip item={item} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-card p-5 frost">
              <h2 className="text-body font-medium text-snow-white">Unscheduled</h2>
              <p className="mt-1 text-caption text-slate">
                Items with no date yet, so they never show on the grid.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {unscheduled.length === 0 ? (
                  <EmptyState>Everything has a date.</EmptyState>
                ) : (
                  unscheduled.map((item) => (
                    <ItemChip key={`${item.kind}-${item.id}`} item={item} />
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

/** Kanban: monday's status buckets, driven by how close the due date is. */
function KanbanView({
  items,
  codeOf,
  renderChip,
}: {
  items: CalItem[];
  codeOf: (id: string) => string;
  renderChip: (item: CalItem) => ReactNode;
}) {
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const buckets: { label: string; test: (item: CalItem) => boolean }[] = [
    { label: "Overdue", test: (i) => Boolean(i.date) && i.date! < today },
    { label: "Today", test: (i) => Boolean(i.date) && sameDay(i.date!, today) },
    {
      label: "This week",
      test: (i) =>
        Boolean(i.date) && i.date! > today && i.date! <= weekEnd && !sameDay(i.date!, today),
    },
    { label: "Later", test: (i) => Boolean(i.date) && i.date! > weekEnd },
    { label: "No date", test: (i) => !i.date },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {buckets.map((bucket) => {
        const list = items.filter(bucket.test);
        return (
          <section key={bucket.label} className="flex flex-col rounded-card p-4 frost">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h2 className="truncate text-body-sm font-medium text-snow-white">{bucket.label}</h2>
              <span className="shrink-0 rounded-pill px-2 py-0.5 text-caption text-slate hairline">
                {list.length}
              </span>
            </div>
            <div className="mt-3 flex flex-1 flex-col gap-2">
              {list.length === 0 ? (
                <p className="text-caption text-slate">Nothing here.</p>
              ) : (
                list.map((item) => (
                  <div key={`${item.kind}-${item.id}`}>
                    <p className="mb-1 text-caption text-slate">
                      {codeOf(item.courseId)}
                      {item.date ? ` · ${item.date.toLocaleDateString()}` : ""}
                    </p>
                    {renderChip(item)}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** List: one flat, sortable-by-date rundown of everything. */
function ListView({
  items,
  codeOf,
  colourOf,
}: {
  items: CalItem[];
  codeOf: (id: string) => string;
  colourOf: (id: string) => string;
}) {
  if (items.length === 0) return <EmptyState>Nothing to list.</EmptyState>;
  return (
    <section className="overflow-hidden rounded-card frost">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.id}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:flex sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colourOf(item.courseId) }}
              />
              <div className="min-w-0">
                <p className="truncate text-body-sm text-snow-white">{item.title}</p>
                <p className="text-caption text-slate">
                  {codeOf(item.courseId)} · {item.kind}
                </p>
              </div>
            </div>
            <p className="shrink-0 text-caption text-smoke">
              {item.date ? item.date.toLocaleString() : "No date"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Timeline: one lane per course across the month on screen. */
function TimelineView({
  cursor,
  courses,
  items,
  colourOf,
}: {
  cursor: Date;
  courses: { id: string; code: string; title: string }[];
  items: CalItem[];
  colourOf: (id: string) => string;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const inMonth = items.filter(
    (i) =>
      i.date!.getMonth() === cursor.getMonth() && i.date!.getFullYear() === cursor.getFullYear(),
  );

  return (
    <section className="overflow-x-auto rounded-card p-4 frost">
      <div className="min-w-[720px]">
        <div className="mb-2 flex items-center gap-3">
          <span className="w-28 shrink-0 text-caption uppercase tracking-wide text-slate">
            Course
          </span>
          <div className="relative flex-1">
            <div className="flex justify-between text-caption text-slate">
              {[1, 8, 15, 22, days].map((d) => (
                <span key={d}>
                  {new Date(first.getFullYear(), first.getMonth(), d).toLocaleDateString(
                    undefined,
                    { day: "numeric", month: "short" },
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {courses.length === 0 ? (
            <EmptyState>No courses to lay out.</EmptyState>
          ) : (
            courses.map((course) => {
              const lane = inMonth.filter((i) => i.courseId === course.id);
              return (
                <div key={course.id} className="flex items-center gap-3">
                  <span
                    className="w-28 shrink-0 truncate text-caption font-medium text-smoke"
                    title={course.title}
                  >
                    {course.code}
                  </span>
                  <div className="relative h-10 flex-1 rounded-card-sm bg-muted hairline">
                    {lane.map((item) => {
                      const left = ((item.date!.getDate() - 1) / days) * 100;
                      return (
                        <span
                          key={`${item.kind}-${item.id}`}
                          title={`${item.title} · ${item.date!.toLocaleDateString()}`}
                          className="absolute top-1/2 -translate-y-1/2 rounded-pill px-2 py-0.5 text-caption text-snow-white"
                          style={{
                            left: `${Math.min(left, 92)}%`,
                            backgroundColor: colourOf(item.courseId),
                            maxWidth: "34%",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title}
                        </span>
                      );
                    })}
                    {lane.length === 0 ? (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-caption text-slate">
                        Nothing this month
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
