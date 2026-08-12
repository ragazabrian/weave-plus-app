import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Folder01Icon,
  FolderAddIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { EmptyState, FilledButton, GhostButton, PageHeader, Pill } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notes/")({
  head: () => ({
    meta: [
      { title: "Notes | weave+" },
      {
        name: "description",
        content:
          "Your linked notes vault: organise notes into folders, colour code them, filter by tag, and jump into the graph.",
      },
      { property: "og:title", content: "Notes | weave+" },
      {
        property: "og:description",
        content:
          "A collaborative vault of linked notes with folders, colours, tags, backlinks and history.",
      },
    ],
  }),
  component: NotesIndex,
});

const UNFILED = "__unfiled__";

type Folder = { id: string; name: string };

/** Folder select, styled to match the system instead of the native control. */
function FolderSelect({
  value,
  folders,
  onChange,
  label,
}: {
  value: string | null;
  folders: Folder[];
  onChange: (id: string | null) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = folders.find((f) => f.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-ui bg-muted px-3 py-2 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
      >
        <HugeiconsIcon icon={Folder01Icon} size={14} strokeWidth={1.6} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{current?.name ?? "Unfiled"}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={13}
          strokeWidth={1.8}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute bottom-full left-0 z-40 mb-1 max-h-52 w-full overflow-y-auto rounded-ui bg-graphite-surface p-1 hairline"
        >
          {[{ id: "", name: "Unfiled" }, ...folders].map((option) => {
            const on = (value ?? "") === option.id;
            return (
              <button
                key={option.id || "unfiled"}
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(option.id || null);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-ui px-2.5 py-2 text-left text-caption font-medium transition-colors",
                  on
                    ? "bg-accent text-snow-white"
                    : "text-smoke hover:bg-muted hover:text-snow-white",
                )}
              >
                <span className="truncate">{option.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function NotesIndex() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tag, setTag] = useState<string | null>(null);
  const [folder, setFolder] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  const folders = useQuery({
    queryKey: ["note-folders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("note_folders")
        .select("id, name, owner_id")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const notes = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, tags, updated_at, is_shared, owner_id, folder_id")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const allTags = Array.from(new Set((notes.data ?? []).flatMap((n) => n.tags ?? []))).sort();

  const visible = (notes.data ?? [])
    .filter((n) => !tag || (n.tags ?? []).includes(tag))
    .filter((n) => (!folder ? true : folder === UNFILED ? !n.folder_id : n.folder_id === folder));

  const countFor = (id: string) =>
    (notes.data ?? []).filter((n) => (id === UNFILED ? !n.folder_id : n.folder_id === id)).length;

  async function createFolder() {
    if (!user) return;
    const name = folderName.trim();
    if (!name) {
      toast.error("Give the folder a name.");
      return;
    }
    const { data, error } = await supabase
      .from("note_folders")
      .insert({ name, owner_id: user.id })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Could not create the folder.");
      return;
    }
    setFolderName("");
    setNewFolder(false);
    setFolder(data.id);
    toast.success(`Folder "${name}" created`);
    queryClient.invalidateQueries({ queryKey: ["note-folders"] });
  }

  async function moveNote(noteId: string, folderId: string | null) {
    const { error } = await supabase.from("notes").update({ folder_id: folderId }).eq("id", noteId);
    if (error) {
      toast.error("Could not move that note.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  }

  async function createNote() {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("notes")
      .insert({
        owner_id: user.id,
        title: "Untitled note",
        content: "",
        tags: [],
        folder_id: folder && folder !== UNFILED ? folder : null,
      })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("Could not create the note.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    navigate({ to: "/notes/$noteId", params: { noteId: data.id }, search: {} });
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Every note you can reach. Group them into folders, link notes with [[double brackets]] to build the graph."
        action={
          <div className="flex flex-wrap gap-2">
            <GhostButton onClick={() => setNewFolder((v) => !v)}>
              <HugeiconsIcon icon={FolderAddIcon} size={16} strokeWidth={1.6} />
              New folder
            </GhostButton>
            <FilledButton onClick={createNote} disabled={creating} compact>
              <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
              New note
            </FilledButton>
          </div>
        }
      />

      {newFolder ? (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-card p-4 frost">
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createFolder();
            }}
            autoFocus
            placeholder="Folder name"
            className="min-w-[220px] flex-1 rounded-ui bg-muted px-4 py-2.5 text-body-sm text-snow-white outline-none hairline placeholder:text-slate"
          />
          <FilledButton onClick={createFolder} compact>
            Create folder
          </FilledButton>
          <GhostButton onClick={() => setNewFolder(false)}>Cancel</GhostButton>
        </div>
      ) : null}

      {/* Folders */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFolder(null)}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
            folder === null
              ? "bg-snow-white text-graphite-surface"
              : "text-smoke hairline hover:bg-muted hover:text-snow-white",
          )}
        >
          All notes
          <span className="text-caption opacity-70">{(notes.data ?? []).length}</span>
        </button>
        {(folders.data ?? []).map((f) => (
          <button
            key={f.id}
            onClick={() => setFolder(f.id)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
              folder === f.id
                ? "bg-snow-white text-graphite-surface"
                : "text-smoke hairline hover:bg-muted hover:text-snow-white",
            )}
          >
            <HugeiconsIcon icon={Folder01Icon} size={15} strokeWidth={1.6} />
            {f.name}
            <span className="text-caption opacity-70">{countFor(f.id)}</span>
          </button>
        ))}
        <button
          onClick={() => setFolder(UNFILED)}
          className={cn(
            "min-h-11 rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
            folder === UNFILED
              ? "bg-snow-white text-graphite-surface"
              : "text-smoke hairline hover:bg-muted hover:text-snow-white",
          )}
        >
          Unfiled <span className="text-caption opacity-70">{countFor(UNFILED)}</span>
        </button>
      </div>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button onClick={() => setTag(null)}>
          <Pill tone={tag === null ? "lavender" : "mist"}>All tags</Pill>
        </button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setTag(t)}>
            <Pill tone={tag === t ? "lavender" : "mist"}>#{t}</Pill>
          </button>
        ))}
        <Link
          to="/notes/graph"
          className="ml-auto text-body-sm font-medium text-bone underline-offset-4 hover:underline"
        >
          Open graph view
        </Link>
      </div>

      {notes.isLoading ? (
        <EmptyState>Loading your vault…</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>No notes here yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((note) => (
            <div
              key={note.id}
              className="flex flex-col rounded-card p-5 frost transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <Link
                to="/notes/$noteId"
                params={{ noteId: note.id }}
                search={{}}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-body font-medium text-snow-white">{note.title}</p>
                <p className="mt-2 line-clamp-3 text-body-sm text-ash">
                  {(note.content ?? "").replace(/[#*[\]]/g, "").slice(0, 180) || "Empty note"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(note.tags ?? []).slice(0, 3).map((t) => (
                    <Pill key={t} tone="mint">
                      #{t}
                    </Pill>
                  ))}
                  {note.is_shared ? <Pill tone="powder">shared</Pill> : null}
                </div>
              </Link>

              <div className="mt-4">
                <FolderSelect
                  value={note.folder_id}
                  folders={folders.data ?? []}
                  onChange={(id) => moveNote(note.id, id)}
                  label={`Folder for ${note.title}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
