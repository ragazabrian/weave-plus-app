import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function GraphViewPage() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Graph view" description="Visualize how your notes link together." />
      <Card className="flex items-center justify-center min-h-96 text-fog text-body">
        Graph rendering isn&apos;t wired up yet — this is a placeholder for the interactive note graph.
      </Card>
    </div>
  );
}
