import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, SectionHeader, StatBlock } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/")({
  head: () => ({
    meta: [
      { title: "Course home | weave+" },
      {
        name: "description",
        content: "Course overview: modules, upcoming deadlines and the latest announcements.",
      },
      { property: "og:title", content: "Course home | weave+" },
      {
        property: "og:description",
        content: "Modules, deadlines and announcements for this course.",
      },
    ],
  }),
  component: CourseHome,
});

function CourseHome() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const isStaff = role === "admin" || role === "lecturer";

  const overview = useQuery({
    queryKey: ["course-home", courseId, user?.id],
    queryFn: async () => {
      const [modules, assignments, announcements, enrollments, progress, submissions] =
        await Promise.all([
          supabase
            .from("modules")
            .select("id, title, summary, position")
            .eq("course_id", courseId)
            .order("position"),
          supabase
            .from("assignments")
            .select("id, title, due_at, points")
            .eq("course_id", courseId)
            .order("due_at"),
          supabase
            .from("announcements")
            .select("id, title, body, created_at")
            .eq("course_id", courseId)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.from("enrollments").select("user_id").eq("course_id", courseId),
          supabase.from("module_progress").select("module_id, user_id, completed_at"),
          supabase.from("submissions").select("assignment_id, user_id, status, grade"),
        ]);
      return {
        modules: modules.data ?? [],
        assignments: assignments.data ?? [],
        announcements: announcements.data ?? [],
        enrollments: enrollments.data ?? [],
        progress: progress.data ?? [],
        submissions: submissions.data ?? [],
      };
    },
  });

  const d = overview.data;
  const moduleIds = new Set((d?.modules ?? []).map((m) => m.id));
  const myDone = (d?.progress ?? []).filter(
    (p) => p.user_id === user?.id && moduleIds.has(p.module_id) && p.completed_at,
  ).length;
  const cohortDone = (d?.progress ?? []).filter(
    (p) => moduleIds.has(p.module_id) && p.completed_at,
  ).length;
  const cohort = d?.enrollments.length ?? 0;
  const assignmentIds = new Set((d?.assignments ?? []).map((a) => a.id));
  const ungraded = (d?.submissions ?? []).filter(
    (s) => assignmentIds.has(s.assignment_id) && s.status === "submitted",
  ).length;
  const upcoming = (d?.assignments ?? [])
    .filter((a) => a.due_at && new Date(a.due_at) > new Date())
    .slice(0, 4);

  if (overview.isLoading) return <EmptyState>Loading course…</EmptyState>;

  const quickActions = [
    ...(isStaff
      ? [
          {
            label: "Import Existing Content",
            hint: "Copy modules and assignments from another course.",
            to: "/courses/$courseId/settings" as const,
          },
          {
            label: "Import from Commons",
            hint: "Pull a shared course template into this shell.",
            to: "/courses/$courseId/settings" as const,
          },
          {
            label: "Choose Home Page",
            hint: "Decide what students land on first.",
            to: "/courses/$courseId/settings" as const,
          },
          {
            label: "New Announcement",
            hint: "Post to the whole cohort.",
            to: "/courses/$courseId/announcements" as const,
          },
        ]
      : []),
    {
      label: "View Course Stream",
      hint: "Recent discussion activity in this course.",
      to: "/courses/$courseId/discussions" as const,
    },
    {
      label: "Course Analytics",
      hint: "Participation and grade distribution.",
      to: "/courses/$courseId/tools/$toolId" as const,
      toolId: "analytics",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <StatBlock label="Modules" value={d?.modules.length ?? 0} />
          <StatBlock
            label={isStaff ? "Enrolled students" : "Modules completed"}
            value={isStaff ? cohort : `${myDone} / ${d?.modules.length ?? 0}`}
          />
          <StatBlock
            label={isStaff ? "Awaiting grading" : "Assignments"}
            value={isStaff ? ungraded : (d?.assignments.length ?? 0)}
            hint={
              isStaff && cohort > 0 && (d?.modules.length ?? 0) > 0
                ? `${Math.round(
                    (cohortDone / (cohort * (d?.modules.length ?? 1))) * 100,
                  )}% cohort module completion`
                : undefined
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section>
            <SectionHeader
              title="Module sequence"
              action={
                <Link
                  to="/courses/$courseId/modules"
                  params={{ courseId }}
                  className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
                >
                  Open modules
                </Link>
              }
            />
            <div className="flex flex-col gap-2">
              {(d?.modules ?? []).slice(0, 5).map((m) => (
                <div key={m.id} className="rounded-card-sm bg-muted p-4 hairline">
                  <p className="text-body-sm font-medium text-snow-white">
                    {m.position}. {m.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-caption text-slate">{m.summary}</p>
                </div>
              ))}
              {(d?.modules ?? []).length === 0 ? <EmptyState>No modules yet.</EmptyState> : null}
            </div>
          </section>

          <section>
            <SectionHeader title="Upcoming deadlines" />
            <div className="mb-8 flex flex-col gap-2">
              {upcoming.length === 0 ? (
                <EmptyState>Nothing due ahead.</EmptyState>
              ) : (
                upcoming.map((a) => (
                  <Link
                    key={a.id}
                    to="/courses/$courseId/assignments/$assignmentId"
                    params={{ courseId, assignmentId: a.id }}
                    className="rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                  >
                    <p className="text-body-sm font-medium text-snow-white">{a.title}</p>
                    <p className="mt-1 text-caption text-slate">
                      due {new Date(a.due_at!).toLocaleString()} · {a.points} pts
                    </p>
                  </Link>
                ))
              )}
            </div>

            <SectionHeader title="Announcements" />
            <div className="flex flex-col gap-2">
              {(d?.announcements ?? []).length === 0 ? (
                <EmptyState>Nothing posted yet.</EmptyState>
              ) : (
                d!.announcements.map((a) => (
                  <Card key={a.id} dense>
                    <p className="text-body-sm font-medium text-snow-white">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-caption text-slate">{a.body}</p>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Home Page quick-action panel */}
      <aside className="flex flex-col gap-3">
        <Card dense>
          <h2 className="text-body font-medium text-snow-white">Quick actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                params={
                  "toolId" in action ? { courseId, toolId: action.toolId } : ({ courseId } as never)
                }
                className="rounded-card-sm bg-muted p-3 transition-colors hairline hover:bg-accent"
              >
                <span className="block text-body-sm font-medium text-snow-white">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-caption text-slate">{action.hint}</span>
              </Link>
            ))}
            <Link
              to="/account/notifications"
              className="rounded-card-sm bg-muted p-3 transition-colors hairline hover:bg-accent"
            >
              <span className="block text-body-sm font-medium text-snow-white">
                View Course Notifications
              </span>
              <span className="mt-0.5 block text-caption text-slate">
                Choose what this course sends you.
              </span>
            </Link>
          </div>
        </Card>

        <Card dense>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-body font-medium text-snow-white">Coming Up</h2>
            <Link
              to="/calendar"
              className="text-caption font-medium text-snow-white underline decoration-slate underline-offset-4"
            >
              View Calendar
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {upcoming.length === 0 ? (
              <p className="text-caption text-slate">Nothing in the next stretch.</p>
            ) : (
              upcoming.map((a) => (
                <Link
                  key={a.id}
                  to="/courses/$courseId/assignments/$assignmentId"
                  params={{ courseId, assignmentId: a.id }}
                  className="rounded-card-sm bg-muted p-3 transition-colors hairline hover:bg-accent"
                >
                  <span className="block truncate text-caption font-medium text-snow-white">
                    {a.title}
                  </span>
                  <span className="mt-0.5 block text-caption text-slate">
                    {new Date(a.due_at!).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}
