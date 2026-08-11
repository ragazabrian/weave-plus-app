import { useCallback, useEffect, useRef, useState } from "react";
import { Tldraw, getSnapshot, loadSnapshot, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { supabase } from "@/integrations/supabase/client";

/**
 * Browser-only whiteboard. Loads the stored snapshot, autosaves changes back to
 * the canvases row, and mirrors remote saves in from other collaborators.
 */
export default function CanvasBoard({
  canvasId,
  snapshot,
  onStatus,
}: {
  canvasId: string;
  snapshot: unknown;
  onStatus?: (status: "saved" | "saving" | "dirty") => void;
}) {
  const editorRef = useRef<Editor | null>(null);
  const savingRef = useRef(false);
  const [, setReady] = useState(false);

  const persist = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || savingRef.current) return;
    savingRef.current = true;
    onStatus?.("saving");
    const next = getSnapshot(editor.store);
    const { error } = await supabase
      .from("canvases")
      .update({ snapshot: next as never, updated_at: new Date().toISOString() })
      .eq("id", canvasId);
    savingRef.current = false;
    onStatus?.(error ? "dirty" : "saved");
  }, [canvasId, onStatus]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      setReady(true);
      if (snapshot) {
        try {
          loadSnapshot(editor.store, snapshot as never);
        } catch {
          // Ignore incompatible snapshots and start from the empty board.
        }
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      editor.store.listen(
        () => {
          onStatus?.("dirty");
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => void persist(), 1500);
        },
        { scope: "document", source: "user" },
      );
    },
    [snapshot, persist, onStatus],
  );

  // Pull in saves made by other collaborators on this canvas.
  useEffect(() => {
    const channel = supabase
      .channel(`canvas:${canvasId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "canvases",
          filter: `id=eq.${canvasId}`,
        },
        (payload) => {
          const editor = editorRef.current;
          const incoming = (payload.new as { snapshot?: unknown }).snapshot;
          if (!editor || !incoming || savingRef.current) return;
          try {
            loadSnapshot(editor.store, incoming as never);
          } catch {
            // Ignore snapshots this client cannot read.
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [canvasId]);

  return (
    <div className="h-[calc(100vh-190px)] min-h-[520px] w-full overflow-hidden rounded-card hairline">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
