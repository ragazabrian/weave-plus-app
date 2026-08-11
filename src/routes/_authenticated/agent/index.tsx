import { createFileRoute } from "@tanstack/react-router";
import { AgentWorkspace } from "@/components/agent-chat";

export const Route = createFileRoute("/_authenticated/agent/")({
  head: () => ({
    meta: [
      { title: "Agent | weave+" },
      {
        name: "description",
        content: "Ask the workspace agent about your notes, courses and deadlines.",
      },
      { property: "og:title", content: "Agent | weave+" },
      { property: "og:description", content: "An agent scoped to what you can access." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] as string } : {},
  component: AgentIndex,
});

function AgentIndex() {
  const { q } = Route.useSearch();
  return <AgentWorkspace initialDraft={q} />;
}
