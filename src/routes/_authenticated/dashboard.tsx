import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardView } from "@/components/dashboard-view";
import { readDemoProfile } from "@/lib/demo-profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => {
    // Demo students get their own, partly locked workspace.
    if (readDemoProfile()?.role === "student") throw redirect({ to: "/student" });
  },
  head: () => ({
    meta: [
      { title: "Dashboard | weave+" },
      {
        name: "description",
        content:
          "Your workspace at a glance: what needs action today, recent notes and course activity.",
      },
      { property: "og:title", content: "Dashboard | weave+" },
      {
        property: "og:description",
        content: "Agent-ranked priorities, deadlines and recent notes for your role.",
      },
    ],
  }),
  component: () => <DashboardView />,
});
