import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, PageHeader, Pill, StatBlock } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio | weave+" },
      {
        name: "description",
        content: "Graded work, shared notes and canvases collected into a portfolio you can show.",
      },
      { property: "og:title", content: "Portfolio | weave+" },
      {
        property: "og:description",
        content: "Your best graded submissions and shared artefacts, gathered automatically.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { user } = useSession();

  const data = useQuery({
    queryKey: ["portfolio", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [submissions, assignments, notes, canvases, courses] = await Promise.all([
        supabase
          .from("submissions")
          .select("id, assignment_id, grade, feedback, status, graded_at")
          .eq("user_id", user!.id)
          .in("status", ["graded", "returned"]),
        supabase.from("assignments").select("id, title, points, course_id"),
        supabase
          .from("notes")
          .select("id, title, updated_at")
          .eq("owner_id", user!.id)
          .eq("is_shared", true),
        supabase
          .from("canvases")
          .select("id, title, updated_at")
          .eq("owner_id", user!.id)
          .eq("is_shared", true),
        supabase.from("courses").select("id, code"),
      ]);
      return {
        submissions: submissions.data ?? [],
        assignments: assignments.data ?? [],
        notes: notes.data ?? [],
        canvases: canvases.data ?? [],
        courses: courses.data ?? [],
      };
    },
  });

  const d = data.data;
  const assignmentOf = (id: string) => d?.assignments.find((a) => a.id === id);
  const codeOf = (courseId: string | undefined) =>
    d?.courses.find((c) => c.id === courseId)?.code ?? "Course";

  const graded = d?.submissions ?? [];
  const scored = graded.filter((s) => s.grade !== null);
  const average =
    scored.length > 0
      ? Math.round(
          (scored.reduce((total, s) => {
            const points = assignmentOf(s.assignment_id)?.points ?? 100;
            return total + (Number(s.grade) / (points || 100)) * 100;
          }, 0) /
            scored.length) *
            10,
        ) / 10
      : null;

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="A living record of graded work and the artefacts you chose to share."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatBlock label="Graded pieces" value={graded.length} />
        <StatBlock label="Average score" value={average === null ? "n/a" : `${average}%`} />
        <StatBlock
          label="Shared artefacts"
          value={(d?.notes.length ?? 0) + (d?.canvases.length ?? 0)}
        />
      </div>

      {data.isLoading ? (
        <EmptyState>Building your portfolio…</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">Graded work</h2>
            <div className="flex flex-col gap-2">
              {graded.length === 0 ? (
                <EmptyState>Nothing graded yet.</EmptyState>
              ) : (
                graded.map((submission) => {
                  const assignment = assignmentOf(submission.assignment_id);
                  return (
                    <div key={submission.id} className="rounded-card-sm bg-muted p-4 hairline">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-body-sm font-medium text-snow-white">
                          {assignment?.title ?? "Assignment"}
                        </p>
                        <Pill>{codeOf(assignment?.course_id)}</Pill>
                      </div>
                      <p className="mt-1 text-caption text-slate">
                        {submission.grade ?? "n/a"} / {assignment?.points ?? "?"} pts
                        {submission.graded_at
                          ? ` · ${new Date(submission.graded_at).toLocaleDateString()}`
                          : ""}
                      </p>
                      {submission.feedback ? (
                        <p className="mt-2 line-clamp-3 text-body-sm text-bone">
                          {submission.feedback}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">Shared artefacts</h2>
            <div className="flex flex-col gap-2">
              {(d?.notes.length ?? 0) + (d?.canvases.length ?? 0) === 0 ? (
                <EmptyState>Share a note or canvas to add it here.</EmptyState>
              ) : (
                <>
                  {(d?.notes ?? []).map((note) => (
                    <Link
                      key={note.id}
                      to="/notes/$noteId"
                      params={{ noteId: note.id }}
                      className="flex items-center justify-between gap-2 rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                    >
                      <span className="truncate text-body-sm font-medium text-snow-white">
                        {note.title}
                      </span>
                      <Pill>note</Pill>
                    </Link>
                  ))}
                  {(d?.canvases ?? []).map((canvas) => (
                    <Link
                      key={canvas.id}
                      to="/canvas/$canvasId"
                      params={{ canvasId: canvas.id }}
                      className="flex items-center justify-between gap-2 rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                    >
                      <span className="truncate text-body-sm font-medium text-snow-white">
                        {canvas.title}
                      </span>
                      <Pill>canvas</Pill>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
