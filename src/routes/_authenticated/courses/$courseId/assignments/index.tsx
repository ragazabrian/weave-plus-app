import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/assignments/")({
  head: () => ({
    meta: [
      { title: "Assignments | weave+" },
      { name: "description", content: "Assignments, deadlines and submission status." },
      { property: "og:title", content: "Assignments | weave+" },
      { property: "og:description", content: "Deadlines and submissions for this course." },
    ],
  }),
  component: Assignments,
});

function Assignments() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const isStaff = role === "admin" || role === "lecturer";

  const data = useQuery({
    queryKey: ["assignments", courseId],
    queryFn: async () => {
      const [assignments, submissions] = await Promise.all([
        supabase
          .from("assignments")
          .select("id, title, instructions, due_at, points")
          .eq("course_id", courseId)
          .order("due_at"),
        supabase.from("submissions").select("assignment_id, user_id, status, grade"),
      ]);
      if (assignments.error) throw assignments.error;
      return { assignments: assignments.data ?? [], submissions: submissions.data ?? [] };
    },
  });

  if (data.isLoading) return <EmptyState>Loading assignments…</EmptyState>;

  return (
    <div>
      <SectionHeader title="Assignments" />
      <div className="flex flex-col gap-2">
        {(data.data?.assignments ?? []).length === 0 ? (
          <EmptyState>No assignments yet.</EmptyState>
        ) : (
          data.data!.assignments.map((a) => {
            const subs = data.data!.submissions.filter((s) => s.assignment_id === a.id);
            const mine = subs.find((s) => s.user_id === user?.id);
            const ungraded = subs.filter((s) => s.status === "submitted").length;
            return (
              <Link
                key={a.id}
                to="/courses/$courseId/assignments/$assignmentId"
                params={{ courseId, assignmentId: a.id }}
                className="rounded-card bg-bone-white p-5 transition-colors hover:bg-dark-charcoal"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-subheading font-medium text-ink">{a.title}</p>
                    <p className="mt-1 text-body-sm text-fog">
                      {a.due_at ? `due ${new Date(a.due_at).toLocaleString()}` : "no due date"} ·{" "}
                      {a.points} pts
                    </p>
                  </div>
                  {isStaff ? (
                    <Pill tone={ungraded > 0 ? "solar" : "mint"}>
                      {ungraded > 0 ? `${ungraded} to grade` : `${subs.length} submitted`}
                    </Pill>
                  ) : (
                    <Pill tone={mine?.status === "graded" ? "mint" : mine ? "powder" : "mist"}>
                      {mine?.status === "graded"
                        ? `graded ${mine.grade ?? 0}/${a.points}`
                        : (mine?.status ?? "not submitted")}
                    </Pill>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
