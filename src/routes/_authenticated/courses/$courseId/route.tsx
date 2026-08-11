import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { courseHex, courseWash } from "@/lib/course-color";
import { EmptyState, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  component: CourseLayout,
});

function CourseLayout() {
  const { courseId } = Route.useParams();

  const course = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, code, description, category, color, starts_on, ends_on")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (course.isLoading) return <EmptyState>Loading course…</EmptyState>;
  if (!course.data)
    return (
      <EmptyState>
        This course isn't available to you.{" "}
        <Link to="/courses" className="text-snow-white underline underline-offset-4">
          Back to courses
        </Link>
      </EmptyState>
    );

  const hex = courseHex(course.data);

  return (
    <div>
      <div
        className="overflow-hidden rounded-card p-6 frost"
        style={{
          background: `linear-gradient(135deg, ${courseWash(hex, 0.26)}, transparent 70%)`,
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-caption uppercase tracking-widest text-slate">{course.data.code}</p>
            <h1 className="mt-1 font-display text-heading font-medium text-snow-white">
              {course.data.title}
            </h1>
            <p className="mt-2 max-w-2xl text-body text-ash">{course.data.description}</p>
          </div>
          <Pill>{course.data.category}</Pill>
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
