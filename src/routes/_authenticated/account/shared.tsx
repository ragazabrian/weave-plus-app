import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/shared")({
  head: () => ({
    meta: [
      { title: "Shared content | weave+" },
      {
        name: "description",
        content: "Notes and canvases shared with your courses, both yours and your cohort's.",
      },
      { property: "og:title", content: "Shared content | weave+" },
      {
        property: "og:description",
        content:
          "Everything shared across your courses, grouped by what you own and what others shared.",
      },
    ],
  }),
  component: SharedContentPage,
});

function SharedContentPage() {
  const { user } = useSession();

  const shared = useQuery({
    queryKey: ["shared-content"],
    queryFn: async () => {
      const [notes, canvases, courses] = await Promise.all([
        supabase
          .from("notes")
          .select("id, title, owner_id, course_id, updated_at")
          .eq("is_shared", true)
          .order("updated_at", { ascending: false }),
        supabase
          .from("canvases")
          .select("id, title, owner_id, course_id, updated_at")
          .eq("is_shared", true)
          .order("updated_at", { ascending: false }),
        supabase.from("courses").select("id, code"),
      ]);
      return {
        notes: notes.data ?? [],
        canvases: canvases.data ?? [],
        courses: courses.data ?? [],
      };
    },
  });

  const codeOf = (courseId: string | null) =>
    shared.data?.courses.find((c) => c.id === courseId)?.code ?? "Personal";

  const notes = shared.data?.notes ?? [];
  const canvases = shared.data?.canvases ?? [];

  return (
    <div>
      <PageHeader
        title="Shared content"
        description="Anything marked as shared becomes readable by the course it belongs to."
      />
      {shared.isLoading ? (
        <EmptyState>Loading shared content…</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">Shared notes</h2>
            <div className="flex flex-col gap-2">
              {notes.length === 0 ? (
                <EmptyState>Nothing shared yet.</EmptyState>
              ) : (
                notes.map((note) => (
                  <Link
                    key={note.id}
                    to="/notes/$noteId"
                    params={{ noteId: note.id }}
                    className="grid gap-1 rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-snow-white">
                        {note.title}
                      </span>
                      <Pill>{codeOf(note.course_id)}</Pill>
                    </span>
                    <span className="text-caption text-slate">
                      {note.owner_id === user?.id ? "shared by you" : "shared with you"}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">Shared canvases</h2>
            <div className="flex flex-col gap-2">
              {canvases.length === 0 ? (
                <EmptyState>Nothing shared yet.</EmptyState>
              ) : (
                canvases.map((canvas) => (
                  <Link
                    key={canvas.id}
                    to="/canvas/$canvasId"
                    params={{ canvasId: canvas.id }}
                    className="grid gap-1 rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-snow-white">
                        {canvas.title}
                      </span>
                      <Pill>{codeOf(canvas.course_id)}</Pill>
                    </span>
                    <span className="text-caption text-slate">
                      {canvas.owner_id === user?.id ? "shared by you" : "shared with you"}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
