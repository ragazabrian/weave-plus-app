import { notFound } from "next/navigation";
import { canvasBoards } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function CanvasDetailPage({ params }: PageProps<"/canvas/[id]">) {
  const { id } = await params;
  const board = canvasBoards.find((b) => b.id === id);
  if (!board) notFound();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={board.title} description={board.courseTitle} />
      <Card className="flex items-center justify-center min-h-[32rem] text-fog text-body">
        The live multiplayer whiteboard (tldraw + real-time sync) isn&apos;t wired up yet — this is a placeholder
        for the canvas surface.
      </Card>
    </div>
  );
}
