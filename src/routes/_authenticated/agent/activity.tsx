import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/agent/activity")({
  head: () => ({
    meta: [
      { title: "Agent activity | weave+" },
      { name: "description", content: "A log of every agent run you're allowed to see." },
      { property: "og:title", content: "Agent activity | weave+" },
      { property: "og:description", content: "Audit what the agent has been doing." },
    ],
  }),
  component: AgentActivity,
});

function AgentActivity() {
  const runs = useQuery({
    queryKey: ["agent-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_runs")
        .select("id, kind, prompt, result, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Agent activity"
        description="Every run the agent has made, newest first."
        action={
          <Link to="/agent" search={{}} className="text-body-sm font-medium text-iris-blue">
            Back to chat
          </Link>
        }
      />
      <div className="flex flex-col gap-2">
        {runs.isLoading ? (
          <EmptyState>Loading activity…</EmptyState>
        ) : (runs.data ?? []).length === 0 ? (
          <EmptyState>No agent runs recorded yet.</EmptyState>
        ) : (
          runs.data!.map((run) => (
            <Card key={run.id} dense>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Pill tone={run.kind === "chat" ? "powder" : "lavender"}>{run.kind}</Pill>
                <span className="text-body-sm text-fog">
                  {new Date(run.created_at).toLocaleString()}
                </span>
              </div>
              {run.prompt ? <p className="mt-3 text-body-sm text-graphite">{run.prompt}</p> : null}
              {run.result ? <p className="mt-2 text-body text-ink">{run.result}</p> : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
