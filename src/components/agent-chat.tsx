import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  ArrowUp01Icon,
  Delete02Icon,
  PinIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { askAgent } from "@/lib/agent.functions";
import { DEFAULT_EFFORT, DEFAULT_MODEL_ID, findModel, type AiEffort } from "@/lib/ai-models";
import { ModelMenu } from "@/components/model-menu";
import { createLocalStore } from "@/lib/local-store";
import { useRole, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { FixedComposer } from "@/components/fixed-composer";
import { HeroBanner, StatTile, StatTileRow } from "@/components/sections";

type ModelChoice = { modelId: string; effort: AiEffort };

const choiceStore = createLocalStore<ModelChoice>(
  "weave-model-choice",
  (raw) => {
    if (!raw) return { modelId: DEFAULT_MODEL_ID, effort: DEFAULT_EFFORT };
    try {
      const parsed = JSON.parse(raw) as Partial<ModelChoice>;
      return {
        // Ignore ids saved before the built-in catalogue changed.
        modelId: findModel(parsed.modelId)?.id ?? DEFAULT_MODEL_ID,
        effort: parsed.effort ?? DEFAULT_EFFORT,
      };
    } catch {
      return { modelId: DEFAULT_MODEL_ID, effort: DEFAULT_EFFORT };
    }
  },
  (value) => JSON.stringify(value),
);

const SUGGESTIONS = [
  "What should I work on next?",
  "Summarise my notes on caching",
  "Which deadlines are at risk?",
  "Draft an announcement for my course",
];

/**
 * Agent workspace: a chat history rail on the left, the transcript in the
 * middle and a composer pinned to the bottom of the viewport.
 */
export function AgentWorkspace({
  chatId,
  initialDraft,
}: {
  chatId?: string;
  initialDraft?: string | undefined;
}) {
  const { user } = useSession();
  const { role } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ask = useServerFn(askAgent);
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [pending, setPending] = useState<string | null>(null);
  // Chat created inside this mount. Navigating mid-request would unmount the
  // component and drop the pending answer, so we hold it locally and move the
  // URL only once the reply has landed.
  const [localChatId, setLocalChatId] = useState<string | null>(null);
  const choice = choiceStore.useStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const activeChatId = chatId ?? localChatId;

  const isStaff = role === "admin" || role === "lecturer";

  const chats = useQuery({
    queryKey: ["agent-chats", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_chats")
        .select("id, title, pinned, updated_at")
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const messages = useQuery({
    queryKey: ["agent-messages", activeChatId],
    enabled: Boolean(activeChatId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_messages")
        .select("id, role, content, created_at")
        .eq("chat_id", activeChatId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [pending, chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.data, pending]);

  async function send(text?: string) {
    const message = (text ?? draft).trim();
    if (!message || pending || !user) return;
    setDraft("");
    setPending(message);

    let activeId = activeChatId;
    try {
      if (!activeId) {
        const { data, error } = await supabase
          .from("agent_chats")
          .insert({ user_id: user.id, title: message.slice(0, 60) })
          .select("id")
          .single();
        if (error || !data) throw new Error("Could not start that chat.");
        activeId = data.id;
        setLocalChatId(activeId);
        void queryClient.invalidateQueries({ queryKey: ["agent-chats", user.id] });
      }

      await ask({
        data: {
          message,
          chatId: activeId,
          modelId: choice.modelId,
          effort: choice.effort,
        },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent-messages", activeId] }),
        queryClient.invalidateQueries({ queryKey: ["agent-chats", user.id] }),
      ]);

      if (!chatId) {
        navigate({ to: "/agent/$chatId", params: { chatId: activeId } });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The agent could not answer.");
    } finally {
      setPending(null);
    }
  }

  async function togglePin(id: string, pinned: boolean) {
    const { error } = await supabase.from("agent_chats").update({ pinned: !pinned }).eq("id", id);
    if (error) {
      toast.error("Could not update that chat.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["agent-chats", user?.id] });
  }

  async function removeChat(id: string) {
    const { error } = await supabase.from("agent_chats").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete that chat.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["agent-chats", user?.id] });
    if (id === chatId) navigate({ to: "/agent", search: {} });
  }

  const transcript = messages.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* History */}
      <aside className="h-max rounded-card p-3 frost lg:sticky lg:top-6">
        <Link
          to="/agent"
          search={{}}
          className="flex min-h-11 items-center justify-center gap-2 rounded-ui bg-snow-white px-3 py-2 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
          New chat
        </Link>

        <p className="mt-4 px-1 text-caption uppercase tracking-widest text-slate">Chats</p>
        <div className="mt-2 flex max-h-[52vh] flex-col gap-0.5 overflow-y-auto">
          {(chats.data ?? []).length === 0 ? (
            <p className="px-1 py-2 text-caption text-slate">No chats yet.</p>
          ) : (
            chats.data!.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group/chat flex items-center gap-1 rounded-ui pr-1 transition-colors",
                  chat.id === chatId ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <Link
                  to="/agent/$chatId"
                  params={{ chatId: chat.id }}
                  className={cn(
                    "min-w-0 flex-1 truncate px-2.5 py-2 text-caption font-medium",
                    chat.id === chatId ? "text-snow-white" : "text-smoke",
                  )}
                  title={chat.title}
                >
                  {chat.pinned ? "📌 " : ""}
                  {chat.title}
                </Link>
                <button
                  onClick={() => togglePin(chat.id, chat.pinned)}
                  aria-label={chat.pinned ? `Unpin ${chat.title}` : `Pin ${chat.title}`}
                  className={cn(
                    "rounded-ui p-1.5 text-slate transition-colors hover:text-snow-white",
                    chat.pinned ? "text-bone" : "opacity-0 group-hover/chat:opacity-100",
                  )}
                >
                  <HugeiconsIcon icon={PinIcon} size={14} strokeWidth={1.6} />
                </button>
                <button
                  onClick={() => removeChat(chat.id)}
                  aria-label={`Delete ${chat.title}`}
                  className="rounded-ui p-1.5 text-slate opacity-0 transition-colors hover:text-snow-white group-hover/chat:opacity-100"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.6} />
                </button>
              </div>
            ))
          )}
        </div>

        {isStaff ? (
          <Link
            to="/agent/activity"
            className="mt-4 block px-1 text-caption text-slate transition-colors hover:text-snow-white"
          >
            Activity log
          </Link>
        ) : null}
      </aside>

      {/* Transcript + sticky composer */}
      <div className="relative min-w-0">
        <div className="flex flex-col gap-3 pb-6 lg:pb-48">
          {transcript.length === 0 && !pending ? (
            <div>
              <HeroBanner
                eyebrow="weave+ agent"
                title="Ask your workspace anything"
                body="The agent reads only what your role can read: notes, courses, assignments and deadlines."
              />

              <StatTileRow>
                <StatTile
                  icon={<HugeiconsIcon icon={SparklesIcon} size={18} strokeWidth={1.8} />}
                  meta={`${(chats.data ?? []).length} saved`}
                  label="Conversations"
                />
                <StatTile
                  icon={<HugeiconsIcon icon={PinIcon} size={18} strokeWidth={1.8} />}
                  meta={`${(chats.data ?? []).filter((c) => c.pinned).length} pinned`}
                  label="Kept for later"
                />
                <StatTile
                  icon={<HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={1.8} />}
                  meta="Start fresh"
                  label="New chat"
                  to="/agent"
                  search={{}}
                />
              </StatTileRow>
            </div>
          ) : null}

          {transcript.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="ml-auto max-w-[85%] rounded-card-sm bg-accent px-4 py-3 hairline"
              >
                <p className="whitespace-pre-wrap text-body text-snow-white">{m.content}</p>
              </div>
            ) : (
              <div key={m.id} className="max-w-[92%] px-1 py-2">
                <p className="whitespace-pre-wrap text-body text-bone">{m.content}</p>
              </div>
            ),
          )}

          {pending ? (
            <>
              <div className="ml-auto max-w-[85%] rounded-card-sm bg-accent px-4 py-3 hairline">
                <p className="whitespace-pre-wrap text-body text-snow-white">{pending}</p>
              </div>
              <p className="animate-pulse px-1 py-2 text-body text-slate">Thinking…</p>
            </>
          ) : null}
          <div ref={endRef} />
        </div>

        <FixedComposer>
          <div className="mb-2 flex flex-col gap-2">
            <p className="text-caption uppercase tracking-widest text-slate">Start with a prompt</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  disabled={Boolean(pending)}
                  className="shrink-0 rounded-pill bg-muted px-4 py-2 text-left text-body-sm font-medium text-snow-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-card bg-graphite-surface/90 p-3 backdrop-blur-xl hairline">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                aria-label="Message the agent"
                placeholder="Ask about your workspace…"
                className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-body text-snow-white outline-none placeholder:text-slate"
              />
              <button
                onClick={() => send()}
                disabled={Boolean(pending) || !draft.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-snow-white text-graphite-surface transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:bg-slate"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/8 pt-2">
              <ModelMenu
                modelId={choice.modelId}
                effort={choice.effort}
                onSelectModel={(modelId) => choiceStore.set({ ...choice, modelId })}
                onSelectEffort={(effort) => choiceStore.set({ ...choice, effort })}
              />
              <span className="text-caption text-slate">Built in, no setup needed</span>
            </div>
          </div>
        </FixedComposer>
      </div>
    </div>
  );
}
