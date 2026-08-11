import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { courseToolById } from "@/lib/course-menu";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  notes: "Notes",
  graph: "Graph view",
  canvas: "Canvas",
  courses: "Courses",
  calendar: "Calendar",
  inbox: "Inbox",
  history: "History",
  agent: "Agent",
  activity: "Activity log",
  plugins: "Integrations",
  help: "Help",
  members: "Members",
  settings: "Settings",
  account: "Account",
  profile: "Profile",
  notifications: "Notifications",
  files: "Files",
  eportfolios: "ePortfolios",
  shared: "Shared content",
  portfolio: "Portfolio",
  qr: "QR for mobile login",
  announcements: "Announcements",
  accessibility: "Accessibility",
  assignments: "Assignments",
  modules: "Modules",
  discussions: "Discussions",
  quizzes: "Quizzes",
  rubrics: "Rubrics",
  people: "People",
  progress: "Grades",
  syllabus: "Syllabus",
  ignite: "Search",
  tools: "Tools",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Trail of where you are, on every signed-in page. */
export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  const courses = useQuery({
    queryKey: ["sidebar-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, code, title").order("code");
      return data ?? [];
    },
  });

  const notes = useQuery({
    queryKey: ["notes-lite"],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("id, title");
      return data ?? [];
    },
  });

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    let label = LABELS[segment] ?? segment.replace(/-/g, " ");

    if (UUID.test(segment)) {
      const course = (courses.data ?? []).find((c) => c.id === segment);
      const note = (notes.data ?? []).find((n) => n.id === segment);
      label = course ? course.code : (note?.title ?? "Detail");
    } else if (segments[index - 1] === "tools") {
      label = courseToolById(segment)?.label ?? label;
    }

    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5">
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 ? (
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={13}
                strokeWidth={1.8}
                className="text-slate"
                aria-hidden
              />
            ) : null}
            {last ? (
              <span aria-current="page" className="text-caption font-medium capitalize text-bone">
                {crumb.label}
              </span>
            ) : (
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={crumb.href as any}
                className="text-caption capitalize text-slate transition-colors hover:text-snow-white"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
