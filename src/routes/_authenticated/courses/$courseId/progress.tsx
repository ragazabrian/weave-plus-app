import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/progress")({
  head: () => ({
    meta: [
      { title: "Progress | weave+" },
      { name: "description", content: "Module completion and grades for this course." },
      { property: "og:title", content: "Progress | weave+" },
      { property: "og:description", content: "Gradebook and module completion." },
    ],
  }),
  component: Progress,
});

function Progress() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const isStaff = role === "admin" || role === "lecturer";

  const data = useQuery({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      const [modules, assignments, enrollments, progress, submissions, profiles] =
        await Promise.all([
          supabase.from("modules").select("id, title, position").eq("course_id", courseId),
          supabase.from("assignments").select("id, title, points").eq("course_id", courseId),
          supabase.from("enrollments").select("user_id").eq("course_id", courseId),
          supabase.from("module_progress").select("module_id, user_id, completed_at"),
          supabase.from("submissions").select("assignment_id, user_id, grade, status"),
          supabase.from("profiles").select("id, full_name, email"),
        ]);
      return {
        modules: modules.data ?? [],
        assignments: assignments.data ?? [],
        enrollments: enrollments.data ?? [],
        progress: progress.data ?? [],
        submissions: submissions.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  if (data.isLoading) return <EmptyState>Loading progress…</EmptyState>;
  const d = data.data!;
  const moduleIds = new Set(d.modules.map((m) => m.id));
  const assignmentIds = new Set(d.assignments.map((a) => a.id));
  const totalPoints = d.assignments.reduce((sum, a) => sum + a.points, 0);

  if (!isStaff) {
    const mineDone = d.progress.filter(
      (p) => p.user_id === user?.id && moduleIds.has(p.module_id) && p.completed_at,
    ).length;
    const earned = d.submissions
      .filter((s) => s.user_id === user?.id && assignmentIds.has(s.assignment_id))
      .reduce((sum, s) => sum + (s.grade ?? 0), 0);
    return (
      <div>
        <SectionHeader title="My progress" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card dense>
            <p className="text-body-sm text-fog">Modules completed</p>
            <p className="mt-2 font-display text-heading-sm font-medium text-ink">
              {mineDone} / {d.modules.length}
            </p>
          </Card>
          <Card dense>
            <p className="text-body-sm text-fog">Points earned</p>
            <p className="mt-2 font-display text-heading-sm font-medium text-ink">
              {earned} / {totalPoints}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Gradebook" description="Per-student completion and points." />
      <div className="flex flex-col gap-2">
        {d.enrollments.length === 0 ? (
          <EmptyState>No students enrolled yet.</EmptyState>
        ) : (
          d.enrollments.map((e) => {
            const profile = d.profiles.find((p) => p.id === e.user_id);
            const done = d.progress.filter(
              (p) => p.user_id === e.user_id && moduleIds.has(p.module_id) && p.completed_at,
            ).length;
            const earned = d.submissions
              .filter((s) => s.user_id === e.user_id && assignmentIds.has(s.assignment_id))
              .reduce((sum, s) => sum + (s.grade ?? 0), 0);
            const pending = d.submissions.filter(
              (s) =>
                s.user_id === e.user_id &&
                assignmentIds.has(s.assignment_id) &&
                s.status === "submitted",
            ).length;
            return (
              <div
                key={e.user_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card-sm bg-bone-white p-4"
              >
                <p className="text-body font-medium text-ink">
                  {profile?.full_name ?? profile?.email ?? "Student"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>
                    {done}/{d.modules.length} modules
                  </Pill>
                  <Pill tone="mint">
                    {earned}/{totalPoints} pts
                  </Pill>
                  {pending > 0 ? <Pill tone="solar">{pending} to grade</Pill> : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
