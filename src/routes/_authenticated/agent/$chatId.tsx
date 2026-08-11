import { createFileRoute } from "@tanstack/react-router";
import { AgentWorkspace } from "@/components/agent-chat";

export const Route = createFileRoute("/_authenticated/agent/$chatId")({
  head: () => ({
    meta: [
      { title: "Agent chat | weave+" },
      {
        name: "description",
        content: "A saved agent conversation about your notes, courses and deadlines.",
      },
      { property: "og:title", content: "Agent chat | weave+" },
      { property: "og:description", content: "Pick up a saved workspace conversation." },
    ],
  }),
  component: AgentChatRoute,
});

function AgentChatRoute() {
  const { chatId } = Route.useParams();
  return <AgentWorkspace chatId={chatId} />;
}
