import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, GhostButton, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/modules")({
  head: () => ({
    meta: [
      { title: "Modules | weave+" },
      { name: "description", content: "The ordered module sequence for this course." },
      { property: "og:title", content: "Modules | weave+" },
      { property: "og:description", content: "Work through the course module by module." },
    ],
  }),
  component: Modules,
});

function Modules() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const isStaff = role === "admin" || role === "lecturer";

  const data = useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      const [modules, progress, enrollments] = await Promise.all([
        supabase
          .from("modules")
          .select("id, title, summary, body, position")
          .eq("course_id", courseId)
          .order("position"),
        supabase.from("module_progress").select("module_id, user_id, completed_at"),
        supabase.from("enrollments").select("user_id").eq("course_id", courseId),
      ]);
      if (modules.error) throw modules.error;
      return {
        modules: modules.data ?? [],
        progress: progress.data ?? [],
        cohort: (enrollments.data ?? []).length,
      };
    },
  });

  async function toggle(moduleId: string, done: boolean) {
    if (!user) return;
    if (done) {
      await supabase
        .from("module_progress")
        .delete()
        .eq("module_id", moduleId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("module_progress").upsert(
        {
          module_id: moduleId,
          user_id: user.id,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "module_id,user_id" },
      );
    }
    queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
  }

  if (data.isLoading) return <EmptyState>Loading modules…</EmptyState>;

  return (
    <div>
      <SectionHeader title="Modules" description="An ordered sequence of course notes." />
      <div className="flex flex-col gap-3">
        {(data.data?.modules ?? []).length === 0 ? (
          <EmptyState>No modules yet.</EmptyState>
        ) : (
          data.data!.modules.map((m) => {
            const mine = data.data!.progress.some(
              (p) => p.module_id === m.id && p.user_id === user?.id && p.completed_at,
            );
            const done = data.data!.progress.filter(
              (p) => p.module_id === m.id && p.completed_at,
            ).length;
            const rate = data.data!.cohort > 0 ? Math.round((done / data.data!.cohort) * 100) : 0;
            return (
              <Card key={m.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-subheading font-medium text-ink">
                      {m.position}. {m.title}
                    </p>
                    <p className="mt-1 text-body text-graphite">{m.summary}</p>
                  </div>
                  {isStaff ? (
                    <Pill tone={rate >= 60 ? "mint" : "solar"}>{rate}% complete</Pill>
                  ) : (
                    <GhostButton onClick={() => toggle(m.id, mine)}>
                      {mine ? "Completed ✓" : "Mark complete"}
                    </GhostButton>
                  )}
                </div>
                {m.body ? (
                  <p className="mt-4 whitespace-pre-wrap text-body text-graphite">{m.body}</p>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
