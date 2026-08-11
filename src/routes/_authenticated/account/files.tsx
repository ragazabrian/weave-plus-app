import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/files")({
  head: () => ({
    meta: [
      { title: "Files | weave+" },
      {
        name: "description",
        content: "Your personal files: notes and canvases you own, newest first.",
      },
      { property: "og:title", content: "Files | weave+" },
      {
        property: "og:description",
        content: "Every note and canvas you own in one personal file list.",
      },
    ],
  }),
  component: FilesPage,
});

function FilesPage() {
  const { user } = useSession();

  const files = useQuery({
    queryKey: ["personal-files", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [notes, canvases] = await Promise.all([
        supabase
          .from("notes")
          .select("id, title, updated_at, is_shared, tags")
          .eq("owner_id", user!.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("canvases")
          .select("id, title, updated_at, is_shared")
          .eq("owner_id", user!.id)
          .order("updated_at", { ascending: false }),
      ]);
      return { notes: notes.data ?? [], canvases: canvases.data ?? [] };
    },
  });

  const notes = files.data?.notes ?? [];
  const canvases = files.data?.canvases ?? [];

  return (
    <div>
      <PageHeader
        title="Files"
        description="Personal storage. Anything you share with a course also appears under Shared content."
      />
      {files.isLoading ? (
        <EmptyState>Loading your files…</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">Notes ({notes.length})</h2>
            <div className="flex flex-col gap-2">
              {notes.length === 0 ? (
                <EmptyState>No notes yet.</EmptyState>
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
                      {note.is_shared ? <Pill>shared</Pill> : null}
                    </span>
                    <span className="text-caption text-slate">
                      updated {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-body font-medium text-snow-white">
              Canvases ({canvases.length})
            </h2>
            <div className="flex flex-col gap-2">
              {canvases.length === 0 ? (
                <EmptyState>No canvases yet.</EmptyState>
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
                      {canvas.is_shared ? <Pill>shared</Pill> : null}
                    </span>
                    <span className="text-caption text-slate">
                      updated {new Date(canvas.updated_at).toLocaleDateString()}
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
