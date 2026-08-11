import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/dashboard-view";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({
    meta: [
      { title: "Student dashboard | weave+" },
      {
        name: "description",
        content:
          "Your courses, notes and deadlines as a student, with the PRO workspace tools clearly marked.",
      },
      { property: "og:title", content: "Student dashboard | weave+" },
      {
        property: "og:description",
        content: "Coursework, deadlines and recent notes for students.",
      },
    ],
  }),
  component: () => <DashboardView studentMode />,
});
