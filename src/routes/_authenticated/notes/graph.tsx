import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, PageHeader } from "@/components/kit";
import { GraphView } from "@/components/graph-view";

export const Route = createFileRoute("/_authenticated/notes/graph")({
  head: () => ({
    meta: [
      { title: "Graph view  notes | weave+" },
      {
        name: "description",
        content:
          "An interactive force graph of every link between the notes you can reach , drag, zoom and isolate any neighbourhood.",
      },
      { property: "og:title", content: "Graph view  notes | weave+" },
      {
        property: "og:description",
        content: "Drag, zoom and isolate the links between your notes.",
      },
    ],
  }),
  component: GraphRoute,
});

function GraphRoute() {
  const navigate = useNavigate();

  const graph = useQuery({
    queryKey: ["note-graph"],
    queryFn: async () => {
      // The data API caps a response at 1000 rows, so page through both tables.
      const notes: Array<{ id: string; title: string }> = [];
      for (let page = 0; page < 20; page += 1) {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title")
          .order("created_at")
          .range(page * 1000, page * 1000 + 999);
        if (error) throw error;
        notes.push(...(data ?? []));
        if ((data?.length ?? 0) < 1000) break;
      }
      const links: Array<{ source_id: string; target_id: string }> = [];
      for (let page = 0; page < 40; page += 1) {
        const { data, error } = await supabase
          .from("note_links")
          .select("source_id, target_id")
          .range(page * 1000, page * 1000 + 999);
        if (error) break;
        links.push(...(data ?? []));
        if ((data?.length ?? 0) < 1000) break;
      }
      return { notes, links };
    },
  });

  const nodes = useMemo(
    () =>
      (graph.data?.notes ?? []).map((note) => ({
        id: note.id,
        label: note.title,
      })),
    [graph.data],
  );

  const links = useMemo(
    () =>
      (graph.data?.links ?? []).map((link) => ({
        source: link.source_id,
        target: link.target_id,
      })),
    [graph.data],
  );

  return (
    <div>
      <PageHeader
        title="Graph view"
        description="Every note you can reach, sized by how many links point at it. Drag to rearrange, scroll to zoom."
        action={
          <Link
            to="/notes"
            className="rounded-pill px-4 py-2 text-body-sm font-medium text-bone transition-colors hairline hover:bg-muted hover:text-snow-white"
          >
            Back to all notes
          </Link>
        }
      />

      {graph.isLoading ? (
        <EmptyState>Mapping your vault…</EmptyState>
      ) : nodes.length === 0 ? (
        <EmptyState>Create a couple of notes to see the graph.</EmptyState>
      ) : (
        <GraphView
          nodes={nodes}
          links={links}
          onSelect={(id) =>
            navigate({
              to: "/notes/$noteId",
              params: { noteId: id },
              search: { from: "graph" },
            })
          }
        />
      )}
    </div>
  );
}
