import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/lib/session";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/quizzes")({
  head: () => ({
    meta: [
      { title: "Quizzes | weave+" },
      {
        name: "description",
        content: "Quiz drafts for this course, currently hidden from students.",
      },
      { property: "og:title", content: "Quizzes | weave+" },
      {
        property: "og:description",
        content: "Staff view of quiz drafts before they are published to the cohort.",
      },
    ],
  }),
  component: QuizzesPage,
});

function QuizzesPage() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const isStaff = role === "admin" || role === "lecturer";

  const quizzes = useQuery({
    queryKey: ["quizzes", courseId],
    enabled: isStaff,
    queryFn: async () => {
      const { data } = await supabase
        .from("assignments")
        .select("id, title, instructions, points, due_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      return (data ?? []).filter((a) => /quiz|test|exam/i.test(a.title));
    },
  });

  if (!isStaff)
    return (
      <EmptyState>
        Quizzes are hidden from students in this course. Assessment runs through assignments for
        now.
      </EmptyState>
    );

  const items = quizzes.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title="Quizzes"
          description="Hidden from students. Anything named as a quiz, test or exam is collected here so you can review it before publishing."
        />
        <div className="flex flex-wrap gap-2">
          <Pill>hidden from students</Pill>
          <Pill>{items.length} drafts</Pill>
        </div>
      </Card>

      {quizzes.isLoading ? (
        <EmptyState>Loading quiz drafts…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>
          No quiz drafts yet. Create an assignment with quiz in the title and it appears here.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((quiz) => (
            <Card key={quiz.id} dense className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-sm font-medium text-snow-white">{quiz.title}</p>
                <Pill>{quiz.points} pts</Pill>
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-caption text-slate">
                {quiz.instructions || "No instructions yet."}
              </p>
              <p className="mt-3 text-caption text-slate">
                {quiz.due_at ? `Due ${new Date(quiz.due_at).toLocaleString()}` : "No due date"}
              </p>
              <Link
                to="/courses/$courseId/assignments/$assignmentId"
                params={{ courseId, assignmentId: quiz.id }}
                className="mt-4 text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
              >
                Edit draft
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
