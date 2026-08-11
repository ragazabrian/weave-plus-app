import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/announcements")({
  head: () => ({
    meta: [
      { title: "Global Announcements | weave+" },
      {
        name: "description",
        content: "Every announcement from every course you can see, newest first.",
      },
      { property: "og:title", content: "Global Announcements | weave+" },
      {
        property: "og:description",
        content: "One stream of announcements across all of your courses.",
      },
    ],
  }),
  component: GlobalAnnouncementsPage,
});

function GlobalAnnouncementsPage() {
  const data = useQuery({
    queryKey: ["global-announcements"],
    queryFn: async () => {
      const [announcements, courses] = await Promise.all([
        supabase
          .from("announcements")
          .select("id, title, body, created_at, course_id")
          .order("created_at", { ascending: false }),
        supabase.from("courses").select("id, code, title"),
      ]);
      return { announcements: announcements.data ?? [], courses: courses.data ?? [] };
    },
  });

  const courseOf = (id: string) => data.data?.courses.find((c) => c.id === id);
  const items = data.data?.announcements ?? [];

  return (
    <div>
      <PageHeader
        title="Global Announcements"
        description="Workspace wide stream. Course specific announcements also stay on their course page."
      />
      {data.isLoading ? (
        <EmptyState>Loading announcements…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>No announcements yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const course = courseOf(item.course_id);
            return (
              <Card key={item.id} dense>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-body font-medium text-snow-white">{item.title}</h2>
                  <Pill>{course?.code ?? "Course"}</Pill>
                </div>
                <p className="mt-1 text-caption text-slate">
                  {new Date(item.created_at).toLocaleString()}
                  {course ? ` · ${course.title}` : ""}
                </p>
                {item.body ? (
                  <p className="mt-3 whitespace-pre-wrap text-body-sm text-bone">{item.body}</p>
                ) : null}
                <Link
                  to="/courses/$courseId/announcements"
                  params={{ courseId: item.course_id }}
                  className="mt-4 inline-block text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
                >
                  Open in course
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
