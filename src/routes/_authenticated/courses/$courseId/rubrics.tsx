import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/rubrics")({
  head: () => ({
    meta: [
      { title: "Rubrics | weave+" },
      {
        name: "description",
        content: "Grading criteria and score bands for every assignment in this course.",
      },
      { property: "og:title", content: "Rubrics | weave+" },
      {
        property: "og:description",
        content: "How each assignment is weighted and what each score band means.",
      },
    ],
  }),
  component: RubricsPage,
});

/** Four band rubric derived from the assignment's available points. */
function bands(points: number) {
  return [
    {
      label: "Distinction",
      range: `${Math.round(points * 0.8)} to ${points}`,
      note: "Exceeds the brief, evidence is precise and well cited.",
    },
    {
      label: "Merit",
      range: `${Math.round(points * 0.65)} to ${Math.round(points * 0.79)}`,
      note: "Meets the brief with clear reasoning and few gaps.",
    },
    {
      label: "Pass",
      range: `${Math.round(points * 0.5)} to ${Math.round(points * 0.64)}`,
      note: "Covers the essentials, reasoning is thin in places.",
    },
    {
      label: "Refer",
      range: `0 to ${Math.round(points * 0.49)}`,
      note: "Key requirements are missing, resubmission needed.",
    },
  ];
}

function RubricsPage() {
  const { courseId } = Route.useParams();

  const data = useQuery({
    queryKey: ["rubrics", courseId],
    queryFn: async () => {
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, title, points, instructions")
        .eq("course_id", courseId)
        .order("due_at", { nullsFirst: false });
      return assignments ?? [];
    },
  });

  const assignments = data.data ?? [];
  const total = assignments.reduce((sum, a) => sum + (a.points ?? 0), 0);

  if (data.isLoading) return <EmptyState>Loading rubrics…</EmptyState>;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title="Rubrics"
          description="Each assignment carries the same four bands, scaled to its available points."
        />
        <div className="flex flex-wrap gap-2">
          <Pill>{assignments.length} assessed items</Pill>
          <Pill>{total} points across the course</Pill>
        </div>
      </Card>

      {assignments.length === 0 ? (
        <EmptyState>No assignments to grade yet.</EmptyState>
      ) : (
        assignments.map((assignment) => (
          <Card key={assignment.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-body font-medium text-snow-white">{assignment.title}</h2>
              <Pill>
                {assignment.points} pts ·{" "}
                {total > 0 ? Math.round((assignment.points / total) * 100) : 0}% of course
              </Pill>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {bands(assignment.points || 100).map((band) => (
                <div key={band.label} className="rounded-card-sm bg-muted p-4 hairline">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-sm font-medium text-snow-white">{band.label}</p>
                    <span className="text-caption text-slate">{band.range}</span>
                  </div>
                  <p className="mt-1 text-caption text-slate">{band.note}</p>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
