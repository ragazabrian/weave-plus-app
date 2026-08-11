import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { History, Link2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession, displayName } from "@/lib/session";
import { Card, EmptyState, GhostButton, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Note | weave+" },
      {
        name: "description",
        content:
          "Edit a note with live collaborators, backlinks and version history in your weave+ vault.",
      },
      { property: "og:title", content: "Note | weave+" },
      {
        property: "og:description",
        content: "Collaborative note editing with backlinks and version history.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { from?: "graph" } =>
    search["from"] === "graph" ? { from: "graph" } : {},
  component: NoteDetail,
});

function extractLinks(content: string) {
  return Array.from(content.matchAll(/\[\[([^\]]+)\]\]/g)).map((m) => (m[1] ?? "").trim());
}

/**
 * Reads #hashtags out of the body. Wiki links are stripped first so a link like
 * [[week #4]] never becomes a tag, and matches must start at a word boundary.
 */
function extractTags(content: string) {
  const body = content.replace(/\[\[[^\]]*\]\]/g, " ");
  const found = Array.from(body.matchAll(/(?:^|[\s(])#([\p{L}\p{N}][\p{L}\p{N}_/-]{0,39})/gu))
    .map((m) => (m[1] ?? "").toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(found));
}

function NoteDetail() {
  const { noteId } = Route.useParams();
  const { from } = Route.useSearch();

  const { user } = useSession();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const loadedRef = useRef<string | null>(null);

  const note = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, tags, updated_at, owner_id, is_shared")
        .eq("id", noteId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const allNotes = useQuery({
    queryKey: ["notes-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("id, title");
      if (error) throw error;
      return data;
    },
  });

  const backlinks = useQuery({
    queryKey: ["backlinks", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_links")
        .select("source_id")
        .eq("target_id", noteId);
      if (error) throw error;
      return data.map((r) => r.source_id);
    },
  });

  const versions = useQuery({
    queryKey: ["note-versions", noteId],
    enabled: showHistory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_versions")
        .select("id, title, content, created_at, edited_by")
        .eq("note_id", noteId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (note.data && loadedRef.current !== note.data.id) {
      loadedRef.current = note.data.id;
      setTitle(note.data.title);
      setContent(note.data.content ?? "");
      setDirty(false);
    }
  }, [note.data]);

  // Live presence: who else has this note open right now.
  useEffect(() => {
    if (!user) return;
    const label = displayName(user, profile?.full_name);
    const channel = supabase.channel(`note:${noteId}`, {
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") channel.track({ name: label });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId, user, profile?.full_name]);

  const titleToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of allNotes.data ?? []) map.set(n.title.toLowerCase(), n.id);
    return map;
  }, [allNotes.data]);

  const outgoing = extractLinks(content);
  const tags = useMemo(() => extractTags(content), [content]);

  async function save() {
    if (!dirty) return;
    setSaving(true);
    const previous = note.data;
    const { error } = await supabase
      .from("notes")
      .update({ title, content, tags, updated_at: new Date().toISOString() })
      .eq("id", noteId);

    if (error) {
      setSaving(false);
      toast.error("Could not save this note.");
      return;
    }

    if (previous && (previous.title !== title || previous.content !== content)) {
      await supabase.from("note_versions").insert({
        note_id: noteId,
        title: previous.title,
        content: previous.content ?? "",
        edited_by: user?.id ?? null,
      });
    }

    // Re-derive [[wiki links]] into note_links so the graph stays accurate.
    const targetIds = Array.from(
      new Set(
        outgoing
          .map((linkTitle) => titleToId.get(linkTitle.toLowerCase()))
          .filter((id): id is string => Boolean(id) && id !== noteId),
      ),
    );
    await supabase.from("note_links").delete().eq("source_id", noteId);
    if (targetIds.length > 0) {
      await supabase
        .from("note_links")
        .insert(targetIds.map((target_id) => ({ source_id: noteId, target_id })));
    }

    setSaving(false);
    setDirty(false);
    toast.success("Saved");
    queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["notes-lite"] });
    queryClient.invalidateQueries({ queryKey: ["note-graph"] });
    queryClient.invalidateQueries({ queryKey: ["note-versions", noteId] });
  }

  // Autosave a couple of seconds after typing stops.
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      void save();
    }, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, content]);

  if (note.isLoading) return <EmptyState>Loading note…</EmptyState>;
  if (!note.data)
    return (
      <EmptyState>
        This note isn't available to you.{" "}
        <Link to="/notes" className="text-iris-blue">
          Back to notes
        </Link>
      </EmptyState>
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {from === "graph" ? (
          <Link to="/notes/graph" className="text-body-sm font-medium text-bone">
            ← Back to graph view
          </Link>
        ) : (
          <Link to="/notes" className="text-body-sm font-medium text-bone">
            ← All notes
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {peers.length > 0 ? (
            <span className="flex items-center gap-1.5 text-body-sm text-graphite">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {peers.slice(0, 3).join(", ")} here now
            </span>
          ) : null}
          <span className="text-body-sm text-fog">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <GhostButton onClick={() => setShowHistory((v) => !v)}>
            <span className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" strokeWidth={1.75} />
              History
            </span>
          </GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            className="w-full bg-transparent font-display text-heading-sm font-medium text-ink outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <span className="text-caption text-fog">
                Type #hashtags in the body to tag this note
              </span>
            ) : (
              tags.map((t) => (
                <Pill key={t} tone="mint">
                  #{t}
                </Pill>
              ))
            )}
            {note.data.is_shared ? <Pill tone="powder">shared</Pill> : null}
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            onBlur={() => void save()}
            rows={26}
            placeholder="Write here. Use [[note title]] to link notes and #hashtags to tag them."
            className="mt-6 w-full resize-none bg-transparent text-body-lg leading-relaxed text-ink outline-none placeholder:text-fog"
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card dense>
            <div className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-graphite" strokeWidth={1.75} />
              <h2 className="text-body font-medium text-ink">Outgoing links</h2>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {outgoing.length === 0 ? (
                <p className="text-body-sm text-fog">
                  None yet , wrap a note title in [[brackets]].
                </p>
              ) : (
                outgoing.map((linkTitle) => {
                  const id = titleToId.get(linkTitle.toLowerCase());
                  return id ? (
                    <Link
                      key={linkTitle}
                      to="/notes/$noteId"
                      params={{ noteId: id }}
                      className="text-body-sm font-medium text-iris-blue"
                    >
                      {linkTitle}
                    </Link>
                  ) : (
                    <span key={linkTitle} className="text-body-sm text-fog">
                      {linkTitle} (no match)
                    </span>
                  );
                })
              )}
            </div>
          </Card>

          <Card dense>
            <h2 className="text-body font-medium text-ink">Backlinks</h2>
            <div className="mt-3 flex flex-col gap-2">
              {(backlinks.data ?? []).length === 0 ? (
                <p className="text-body-sm text-fog">Nothing links here yet.</p>
              ) : (
                backlinks.data!.map((id) => (
                  <Link
                    key={id}
                    to="/notes/$noteId"
                    params={{ noteId: id }}
                    className="text-body-sm font-medium text-iris-blue"
                  >
                    {allNotes.data?.find((n) => n.id === id)?.title ?? "Note"}
                  </Link>
                ))
              )}
            </div>
          </Card>

          {showHistory ? (
            <Card dense>
              <h2 className="text-body font-medium text-ink">Version history</h2>
              <div className="mt-3 flex flex-col gap-3">
                {(versions.data ?? []).length === 0 ? (
                  <p className="text-body-sm text-fog">No earlier versions yet.</p>
                ) : (
                  versions.data!.map((version) => (
                    <div key={version.id} className="rounded-card-sm bg-dark-charcoal p-3">
                      <p className="text-body-sm font-medium text-ink">{version.title}</p>
                      <p className="mt-1 text-caption text-fog">
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                      <button
                        onClick={() => {
                          setTitle(version.title);
                          setContent(version.content);
                          setDirty(true);
                        }}
                        className="mt-2 text-body-sm font-medium text-iris-blue"
                      >
                        Restore into editor
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
