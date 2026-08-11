import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession, displayName } from "@/lib/session";
import { EmptyState } from "@/components/kit";

const CanvasBoard = lazy(() => import("@/components/canvas-board"));

export const Route = createFileRoute("/_authenticated/canvas/$canvasId")({
  head: () => ({
    meta: [
      { title: "Whiteboard | weave+" },
      {
        name: "description",
        content:
          "A shared whiteboard that saves as you draw, with live presence for everyone in the room.",
      },
      { property: "og:title", content: "Whiteboard | weave+" },
      {
        property: "og:description",
        content: "Sketch together on a persistent multiplayer canvas.",
      },
    ],
  }),
  component: CanvasDetail,
});

function CanvasDetail() {
  const { canvasId } = Route.useParams();
  const { user } = useSession();
  const { data: profile } = useProfile();
  const [status, setStatus] = useState<"saved" | "saving" | "dirty">("saved");
  const [peers, setPeers] = useState<string[]>([]);

  const canvas = useQuery({
    queryKey: ["canvas", canvasId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canvases")
        .select("id, title, snapshot, is_shared")
        .eq("id", canvasId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user) return;
    const label = displayName(user, profile?.full_name);
    const channel = supabase.channel(`canvas-presence:${canvasId}`, {
      config: { presence: { key: user.id } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name: string }>();
        setPeers(
          Object.entries(state)
            .filter(([key]) => key !== user.id)
            .map(([, entries]) => entries[0]?.name ?? "Someone"),
        );
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") channel.track({ name: label });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [canvasId, user, profile?.full_name]);

  if (canvas.isLoading) return <EmptyState>Loading canvas…</EmptyState>;
  if (!canvas.data)
    return (
      <EmptyState>
        This canvas isn't available to you.{" "}
        <Link to="/canvas" className="text-iris-blue">
          Back to canvases
        </Link>
      </EmptyState>
    );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/canvas" className="text-body-sm font-medium text-smoke">
            ← All canvases
          </Link>
          <h1 className="mt-2 font-display text-heading-sm font-medium text-snow-white">
            {canvas.data.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {peers.length > 0 ? (
            <span className="flex items-center gap-1.5 text-body-sm text-smoke">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {peers.slice(0, 3).join(", ")} drawing
            </span>
          ) : null}
          <span className="text-body-sm text-slate">
            {status === "saving"
              ? "Saving…"
              : status === "dirty"
                ? "Unsaved changes"
                : "All changes saved"}
          </span>
        </div>
      </div>

      <ClientOnly
        fallback={<div className="h-[calc(100vh-190px)] min-h-[520px] w-full rounded-card frost" />}
      >
        <Suspense
          fallback={
            <div className="h-[calc(100vh-190px)] min-h-[520px] w-full rounded-card frost" />
          }
        >
          <CanvasBoard canvasId={canvasId} snapshot={canvas.data.snapshot} onStatus={setStatus} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
