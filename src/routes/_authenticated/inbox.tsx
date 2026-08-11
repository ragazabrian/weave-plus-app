import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Mail01Icon,
  UserGroupIcon,
  TeachingIcon,
  PlugSocketIcon,
  ArrowUp01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { EmptyState, FilledButton, GhostButton, Pill } from "@/components/kit";
import { initialsOf } from "@/lib/course-color";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox | weave+" },
      { name: "description", content: "Direct and course-scoped message threads." },
      { property: "og:title", content: "Inbox | weave+" },
      { property: "og:description", content: "Your message threads in one place." },
    ],
  }),
  component: InboxPage,
});

type Filter = "all" | "direct" | "spaces";

function timeLabel(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const sameDay = new Date().toDateString() === date.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function InboxPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const endRef = useRef<HTMLDivElement>(null);

  const people = useQuery({
    queryKey: ["inbox-people"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const [threads, courses, latest] = await Promise.all([
        supabase
          .from("threads")
          .select("id, subject, course_id, updated_at, created_at")
          .order("updated_at", { ascending: false }),
        supabase.from("courses").select("id, code, title"),
        supabase
          .from("messages")
          .select("id, thread_id, body, created_at, author_id")
          .order("created_at", { ascending: false })
          .limit(300),
      ]);
      if (threads.error) throw threads.error;
      return {
        threads: threads.data ?? [],
        courses: courses.data ?? [],
        latest: latest.data ?? [],
      };
    },
  });

  const visibleThreads = (threads.data?.threads ?? []).filter((t) =>
    filter === "all" ? true : filter === "spaces" ? Boolean(t.course_id) : !t.course_id,
  );

  const current = activeId && visibleThreads.some((t) => t.id === activeId) ? activeId : null;
  const currentThread = visibleThreads.find((t) => t.id === current);

  const messages = useQuery({
    queryKey: ["messages", current],
    enabled: Boolean(current),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, body, author_id, created_at")
        .eq("thread_id", current!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.data]);

  const nameOf = (id: string | null) => {
    if (!id) return "Member";
    if (id === user?.id) return "You";
    const person = (people.data ?? []).find((p) => p.id === id);
    return person?.full_name ?? person?.email ?? "Member";
  };

  const lastFor = (threadId: string) =>
    (threads.data?.latest ?? []).find((m) => m.thread_id === threadId);

  async function createThread() {
    if (!user) return;
    if (!subject.trim()) {
      toast.error("Give the conversation a subject.");
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("threads")
      .insert({ subject: subject.trim(), created_by: user.id })
      .select("id")
      .single();
    if (error || !data) {
      setCreating(false);
      toast.error("Could not start the conversation.");
      return;
    }
    const members = Array.from(new Set([user.id, ...participants]));
    const { error: joinError } = await supabase
      .from("thread_participants")
      .insert(members.map((id) => ({ thread_id: data.id, user_id: id })));
    setCreating(false);
    if (joinError) {
      toast.error("Conversation created, but some people could not be added.");
    } else {
      toast.success("Conversation started");
    }
    setSubject("");
    setParticipants([]);
    setComposing(false);
    setActiveId(data.id);
    queryClient.invalidateQueries({ queryKey: ["threads"] });
  }

  function togglePerson(id: string) {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function send() {
    if (!current || !draft.trim() || !user) return;
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase
      .from("messages")
      .insert({ thread_id: current, body, author_id: user.id });
    if (error) {
      toast.error("Could not send the message.");
      return;
    }
    await supabase
      .from("threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", current);
    queryClient.invalidateQueries({ queryKey: ["messages", current] });
    queryClient.invalidateQueries({ queryKey: ["threads"] });
  }

  const shortcut = (label: string, value: Filter, icon: typeof Mail01Icon, count: number) => (
    <button
      onClick={() => setFilter(value)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-ui px-3 py-2 text-body-sm font-medium transition-colors",
        filter === value
          ? "bg-accent text-snow-white"
          : "text-smoke hover:bg-muted hover:text-snow-white",
      )}
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.6} className="shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="shrink-0 text-caption text-slate">{count}</span>
    </button>
  );

  const allThreads = threads.data?.threads ?? [];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_300px_minmax(0,1fr)]">
        {/* Rail */}
        <aside
          className={cn(
            "h-max rounded-card p-3 frost lg:sticky lg:top-6 lg:block",
            current && "hidden",
          )}
        >
          <button
            onClick={() => setComposing(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-ui bg-snow-white px-3 py-2 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
            New chat
          </button>

          <p className="mt-4 px-1 text-caption uppercase tracking-widest text-slate">Shortcuts</p>
          <div className="mt-2 flex flex-col gap-0.5">
            {shortcut("All conversations", "all", Mail01Icon, allThreads.length)}
            {shortcut(
              "Direct messages",
              "direct",
              UserGroupIcon,
              allThreads.filter((t) => !t.course_id).length,
            )}
            {shortcut(
              "Spaces",
              "spaces",
              TeachingIcon,
              allThreads.filter((t) => t.course_id).length,
            )}
          </div>

          <p className="mt-4 px-1 text-caption uppercase tracking-widest text-slate">Apps</p>
          <div className="mt-2 flex items-center gap-2 rounded-ui px-3 py-2 text-caption text-slate">
            <HugeiconsIcon icon={PlugSocketIcon} size={15} strokeWidth={1.6} />
            Nothing connected
          </div>
        </aside>

        {/* Thread list */}
        <div
          className={cn(
            "h-max flex-col gap-1 rounded-card p-2 frost lg:sticky lg:top-6 lg:flex lg:max-h-[76vh] lg:overflow-y-auto",
            current ? "hidden" : "flex",
          )}
        >
          {threads.isLoading ? (
            <p className="p-4 text-body-sm text-slate">Loading…</p>
          ) : visibleThreads.length === 0 ? (
            <p className="p-4 text-body-sm text-slate">Nothing here yet.</p>
          ) : (
            visibleThreads.map((t) => {
              const last = lastFor(t.id);
              const on = current === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-card-sm px-3 py-3 text-left transition-colors",
                    on ? "bg-accent" : "hover:bg-muted",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-snow-white hairline"
                  >
                    {initialsOf(t.subject) || "W"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-snow-white">
                        {t.subject}
                      </span>
                      <span className="shrink-0 text-caption text-slate">
                        {timeLabel(last?.created_at ?? t.updated_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-caption text-slate">
                      {last ? `${nameOf(last.author_id)}: ${last.body}` : "No messages yet"}
                    </span>
                    {t.course_id ? (
                      <Pill className="mt-2 inline-block">
                        {threads.data!.courses.find((c) => c.id === t.course_id)?.code ?? "course"}
                      </Pill>
                    ) : null}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Reading pane */}
        <section
          className={cn(
            "min-h-[60vh] flex-col rounded-card p-4 frost sm:p-6 lg:flex",
            !current && !composing ? "hidden lg:flex" : "flex",
          )}
        >
          {composing ? (
            <div className="mb-4 rounded-card-sm bg-muted p-4 hairline">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-subheading font-medium text-snow-white">New conversation</h2>
                <button
                  onClick={() => setComposing(false)}
                  aria-label="Close composer"
                  className="rounded-ui p-1.5 text-slate hover:text-snow-white"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.6} />
                </button>
              </div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="mt-3 w-full rounded-input bg-accent px-4 py-3 text-body text-snow-white outline-none placeholder:text-slate"
              />
              <p className="mt-4 text-caption uppercase tracking-widest text-slate">Participants</p>
              <div className="mt-2 flex max-h-40 flex-wrap gap-1 overflow-y-auto">
                {(people.data ?? [])
                  .filter((p) => p.id !== user?.id)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePerson(p.id)}
                      aria-pressed={participants.includes(p.id)}
                    >
                      <Pill tone={participants.includes(p.id) ? "lavender" : "mist"}>
                        {p.full_name ?? p.email ?? "Member"}
                      </Pill>
                    </button>
                  ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <FilledButton onClick={createThread} disabled={creating} compact>
                  {creating ? "Starting…" : "Start chat"}
                </FilledButton>
                <GhostButton onClick={() => setComposing(false)}>Cancel</GhostButton>
              </div>
            </div>
          ) : null}

          {!current ? (
            <EmptyState>Select a conversation to read it, or start a new chat.</EmptyState>
          ) : (
            <>
              <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border bg-graphite-surface/80 pb-4 backdrop-blur-xl">
                <button
                  onClick={() => setActiveId(null)}
                  className="min-h-9 rounded-pill px-3 text-caption font-medium text-smoke hairline hover:text-snow-white lg:hidden"
                >
                  ← Chats
                </button>
                <h2 className="min-w-0 flex-1 truncate text-subheading font-medium text-snow-white">
                  {currentThread?.subject}
                </h2>
                {currentThread?.course_id ? (
                  <Pill>
                    {threads.data!.courses.find((c) => c.id === currentThread.course_id)?.code ??
                      "course"}
                  </Pill>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-5 lg:max-h-[52vh]">
                {(messages.data ?? []).length === 0 ? (
                  <p className="text-body text-slate">No messages in this thread yet.</p>
                ) : (
                  messages.data!.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-snow-white hairline"
                      >
                        {initialsOf(nameOf(m.author_id)) || "M"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-caption text-slate">
                          {nameOf(m.author_id)} · {new Date(m.created_at).toLocaleString()}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-body text-snow-white">
                          {m.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <div className="sticky bottom-0 z-10 mt-auto -mx-4 px-4 pt-8 sm:-mx-6 sm:px-6">
                {/* Gradient veil so the transcript fades behind the reply box */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite-surface via-graphite-surface/90 to-transparent"
                />
                <div className="relative flex items-end gap-2 rounded-card bg-muted p-3 hairline">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={2}
                    aria-label="Write a reply"
                    placeholder="Write a reply…"
                    className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-body text-snow-white outline-none placeholder:text-slate"
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim()}
                    aria-label="Send reply"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-snow-white text-graphite-surface transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:bg-slate"
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
