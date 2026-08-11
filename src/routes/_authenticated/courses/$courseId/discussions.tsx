import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, FilledButton, GhostButton, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/discussions")({
  head: () => ({
    meta: [
      { title: "Discussions | weave+" },
      {
        name: "description",
        content: "Threaded course discussions where the cohort and lecturers answer each other.",
      },
      { property: "og:title", content: "Discussions | weave+" },
      {
        property: "og:description",
        content: "Open a topic, reply in thread, keep the whole cohort in one conversation.",
      },
    ],
  }),
  component: DiscussionsPage,
});

function DiscussionsPage() {
  const { courseId } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [opening, setOpening] = useState("");
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const threads = useQuery({
    queryKey: ["discussions", courseId],
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("threads")
        .select("id, subject, created_at, created_by")
        .eq("course_id", courseId)
        .order("updated_at", { ascending: false });
      const list = rows ?? [];
      const ids = list.map((t) => t.id);
      const { data: msgs } = ids.length
        ? await supabase
            .from("messages")
            .select("id, thread_id, body, author_id, created_at")
            .in("thread_id", ids)
            .order("created_at")
        : { data: [] };
      const authorIds = Array.from(
        new Set((msgs ?? []).map((m) => m.author_id).filter(Boolean) as string[]),
      );
      const { data: people } = authorIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", authorIds)
        : { data: [] };
      return { threads: list, messages: msgs ?? [], people: people ?? [] };
    },
  });

  const nameOf = (id: string | null) => {
    const person = threads.data?.people.find((p) => p.id === id);
    return person?.full_name || person?.email || "Someone";
  };

  const create = useMutation({
    mutationFn: async () => {
      const { data: thread, error } = await supabase
        .from("threads")
        .insert({ subject: subject.trim(), course_id: courseId, created_by: user!.id })
        .select("id")
        .single();
      if (error) throw error;
      await supabase
        .from("thread_participants")
        .insert({ thread_id: thread.id, user_id: user!.id });
      const { error: messageError } = await supabase
        .from("messages")
        .insert({ thread_id: thread.id, author_id: user!.id, body: opening.trim() });
      if (messageError) throw messageError;
    },
    onSuccess: () => {
      toast.success("Discussion opened");
      setSubject("");
      setOpening("");
      queryClient.invalidateQueries({ queryKey: ["discussions", courseId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const post = useMutation({
    mutationFn: async (threadId: string) => {
      await supabase
        .from("thread_participants")
        .upsert({ thread_id: threadId, user_id: user!.id }, { onConflict: "thread_id,user_id" });
      const { error } = await supabase
        .from("messages")
        .insert({ thread_id: threadId, author_id: user!.id, body: reply.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["discussions", courseId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title="Start a discussion"
          description="Ask the cohort, not just the lecturer. Everyone in the course can reply."
        />
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!subject.trim() || !opening.trim()) {
              toast.error("Add a topic and an opening post.");
              return;
            }
            create.mutate();
          }}
        >
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Topic"
            className="min-h-11 rounded-ui bg-muted px-3 text-body-sm text-snow-white hairline placeholder:text-slate"
          />
          <textarea
            value={opening}
            onChange={(event) => setOpening(event.target.value)}
            rows={4}
            placeholder="Opening post"
            className="rounded-ui bg-muted p-3 text-body-sm text-snow-white hairline placeholder:text-slate"
          />
          <FilledButton type="submit" compact disabled={create.isPending} className="self-start">
            Post discussion
          </FilledButton>
        </form>
      </Card>

      {threads.isLoading ? (
        <EmptyState>Loading discussions…</EmptyState>
      ) : (threads.data?.threads.length ?? 0) === 0 ? (
        <EmptyState>No discussions yet. Be the first to open one.</EmptyState>
      ) : (
        (threads.data?.threads ?? []).map((thread) => {
          const messages = (threads.data?.messages ?? []).filter((m) => m.thread_id === thread.id);
          const expanded = openThread === thread.id;
          return (
            <Card key={thread.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-body font-medium text-snow-white">
                    {thread.subject}
                  </h2>
                  <p className="mt-1 text-caption text-slate">
                    {messages.length} {messages.length === 1 ? "post" : "posts"} · opened by{" "}
                    {nameOf(thread.created_by)} · {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
                <GhostButton onClick={() => setOpenThread(expanded ? null : thread.id)}>
                  {expanded ? "Hide replies" : "View replies"}
                </GhostButton>
              </div>

              {expanded ? (
                <div className="mt-5 flex flex-col gap-3">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-card-sm bg-muted p-4 hairline">
                      <p className="text-caption text-slate">
                        {nameOf(message.author_id)} ·{" "}
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-body-sm text-bone">
                        {message.body}
                      </p>
                    </div>
                  ))}
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!reply.trim()) return;
                      post.mutate(thread.id);
                    }}
                  >
                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      rows={3}
                      placeholder="Write a reply"
                      className="rounded-ui bg-muted p-3 text-body-sm text-snow-white hairline placeholder:text-slate"
                    />
                    <FilledButton
                      type="submit"
                      compact
                      disabled={post.isPending}
                      className="self-start"
                    >
                      Reply
                    </FilledButton>
                  </form>
                </div>
              ) : null}
            </Card>
          );
        })
      )}
    </div>
  );
}
