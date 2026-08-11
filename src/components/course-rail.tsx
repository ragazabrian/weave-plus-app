import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/lib/session";
import { visibleCourseMenu, type CourseMenuItem } from "@/lib/course-menu";
import { cn } from "@/lib/utils";

/**
 * Second sidebar: the course menu, rendered as a real rail next to the global
 * navigation whenever a course is open.
 */
export function CourseRail({
  courseId,
  variant = "rail",
}: {
  courseId: string;
  variant?: "rail" | "inline";
}) {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStaff = role !== "student";
  const menu = visibleCourseMenu(isStaff);

  const course = useQuery({
    queryKey: ["course-rail", courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, code, title")
        .eq("id", courseId)
        .maybeSingle();
      return data;
    },
  });

  const itemClass = (on: boolean) =>
    cn(
      "flex items-center justify-between gap-2 rounded-ui px-3 py-2 text-body-sm font-medium transition-colors duration-200",
      on ? "bg-accent text-snow-white" : "text-smoke hover:bg-muted hover:text-snow-white",
    );

  const entry = (item: CourseMenuItem) => {
    if (item.kind === "page") {
      const href = item.to.replace("$courseId", courseId);
      return (
        <Link
          key={item.label}
          to={item.to}
          params={{ courseId }}
          className={itemClass(pathname === href)}
        >
          <span className="truncate">
            {item.label === "Grades" && isStaff ? "Gradebook" : item.label}
          </span>
        </Link>
      );
    }
    const href = `/courses/${courseId}/tools/${item.toolId}`;
    return (
      <Link
        key={item.label}
        to="/courses/$courseId/tools/$toolId"
        params={{ courseId, toolId: item.toolId }}
        className={cn(itemClass(pathname === href), item.state === "disabled" && "opacity-60")}
        title={item.external ? "External tool" : undefined}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const list = (
    <>
      <div className="mb-3 min-w-0 px-2">
        <p className="text-caption uppercase tracking-widest text-slate">
          {course.data?.code ?? "Course"}
        </p>
        <p className="mt-1 truncate text-body-sm font-medium text-snow-white">
          {course.data?.title ?? "Loading…"}
        </p>
      </div>
      <div className="flex flex-col gap-0.5">{menu.map(entry)}</div>
    </>
  );

  if (variant === "inline") {
    return <div className="mt-4 border-t border-border pt-4">{list}</div>;
  }

  return (
    <aside
      aria-label="Course navigation"
      className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-border px-3 py-6 lg:flex"
    >
      {list}
    </aside>
  );
}
