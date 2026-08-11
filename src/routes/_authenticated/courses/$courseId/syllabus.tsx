import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/syllabus")({
  head: () => ({
    meta: [
      { title: "Syllabus | weave+" },
      {
        name: "description",
        content: "Course description, weekly module plan and the full assignment schedule.",
      },
      { property: "og:title", content: "Syllabus | weave+" },
      {
        property: "og:description",
        content: "Everything the course covers and every dated assignment in one place.",
      },
    ],
  }),
  component: SyllabusPage,
});

function SyllabusPage() {
  const { courseId } = Route.useParams();

  const data = useQuery({
    queryKey: ["syllabus", courseId],
    queryFn: async () => {
      const [course, modules, assignments] = await Promise.all([
        supabase
          .from("courses")
          .select("title, code, description, starts_on, ends_on, subject")
          .eq("id", courseId)
          .maybeSingle(),
        supabase
          .from("modules")
          .select("id, title, summary, position")
          .eq("course_id", courseId)
          .order("position"),
        supabase
          .from("assignments")
          .select("id, title, points, due_at")
          .eq("course_id", courseId)
          .order("due_at", { nullsFirst: false }),
      ]);
      return {
        course: course.data,
        modules: modules.data ?? [],
        assignments: assignments.data ?? [],
      };
    },
  });

  if (data.isLoading) return <EmptyState>Loading syllabus…</EmptyState>;

  const course = data.data?.course;
  const modules = data.data?.modules ?? [];
  const assignments = data.data?.assignments ?? [];
  const totalPoints = assignments.reduce((total, a) => total + (a.points ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionHeader
          title="Course description"
          description="What this course sets out to do and how it is assessed."
        />
        <p className="whitespace-pre-wrap text-body text-bone">
          {course?.description || "No description has been written yet."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {course?.subject ? <Pill>{course.subject}</Pill> : null}
          <Pill>
            {course?.starts_on
              ? new Date(course.starts_on).toLocaleDateString()
              : "start date to confirm"}
          </Pill>
          <Pill>
            {course?.ends_on
              ? new Date(course.ends_on).toLocaleDateString()
              : "end date to confirm"}
          </Pill>
          <Pill>{totalPoints} points total</Pill>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Weekly plan" description="Modules run in this order." />
        {modules.length === 0 ? (
          <EmptyState>No modules published yet.</EmptyState>
        ) : (
          <ol className="flex flex-col gap-2">
            {modules.map((module, index) => (
              <li key={module.id} className="rounded-card-sm bg-muted p-4 hairline">
                <p className="text-caption uppercase tracking-wide text-slate">Week {index + 1}</p>
                <p className="mt-1 text-body-sm font-medium text-snow-white">{module.title}</p>
                {module.summary ? (
                  <p className="mt-1 text-caption text-slate">{module.summary}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <SectionHeader
          title="Assignment schedule"
          description="Every dated item, earliest first. Undated items sit at the end."
        />
        {assignments.length === 0 ? (
          <EmptyState>No assignments yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="text-caption uppercase tracking-wide text-slate">
                  <th className="pb-3 pr-4 font-medium">Assignment</th>
                  <th className="pb-3 pr-4 font-medium">Due</th>
                  <th className="pb-3 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-t border-border">
                    <td className="py-3 pr-4">
                      <Link
                        to="/courses/$courseId/assignments/$assignmentId"
                        params={{ courseId, assignmentId: assignment.id }}
                        className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
                      >
                        {assignment.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-body-sm text-bone">
                      {assignment.due_at
                        ? new Date(assignment.due_at).toLocaleString()
                        : "No due date"}
                    </td>
                    <td className="py-3 text-body-sm text-bone">{assignment.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
