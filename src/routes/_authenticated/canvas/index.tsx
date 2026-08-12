import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { EmptyState, FilledButton, PageHeader, Pill } from "@/components/kit";
import { CanvasThumbnail } from "@/components/canvas-thumbnail";

export const Route = createFileRoute("/_authenticated/canvas/")({
  head: () => ({
    meta: [
      { title: "Canvas | weave+" },
      {
        name: "description",
        content:
          "Shared whiteboards for sketching architecture, mapping ideas and running live workshops.",
      },
      { property: "og:title", content: "Canvas | weave+" },
      {
        property: "og:description",
        content: "Multiplayer whiteboards that live beside your notes and courses.",
      },
    ],
  }),
  component: CanvasIndex,
});

const WASHES = ["bg-lavender-wash", "bg-mint-wash", "bg-powder-blue", "bg-solar-wash"];

function CanvasIndex() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const canvases = useQuery({
    queryKey: ["canvases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canvases")
        .select("id, title, is_shared, updated_at, course_id, snapshot")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function createCanvas() {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("canvases")
      .insert({ owner_id: user.id, title: "Untitled canvas", is_shared: true })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("Could not create the canvas.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["canvases"] });
    navigate({ to: "/canvas/$canvasId", params: { canvasId: data.id } });
  }

  return (
    <div>
      <PageHeader
        title="Canvas"
        description="Whiteboards you can open together , sketches persist for everyone with access."
        action={
          <FilledButton onClick={createCanvas} disabled={creating} compact>
            <span className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New canvas
            </span>
          </FilledButton>
        }
      />

      {canvases.isLoading ? (
        <EmptyState>Loading canvases…</EmptyState>
      ) : (canvases.data ?? []).length === 0 ? (
        <EmptyState>No canvases yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {canvases.data!.map((canvas, index) => (
            <Link
              key={canvas.id}
              to="/canvas/$canvasId"
              params={{ canvasId: canvas.id }}
              className="group/canvas flex flex-col rounded-card p-3 frost transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <CanvasThumbnail
                snapshot={canvas.snapshot}
                className={`h-36 overflow-hidden rounded-card ${WASHES[index % WASHES.length]}`}
              />
              <div className="px-2 pb-1 pt-4">
                <p className="truncate text-body font-medium text-snow-white">{canvas.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  {canvas.is_shared ? <Pill tone="powder">shared</Pill> : null}
                  <span className="text-caption text-slate">
                    edited {new Date(canvas.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
