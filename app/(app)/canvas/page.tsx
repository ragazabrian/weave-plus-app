import Link from "next/link";
import { canvasBoards } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function CanvasListPage() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Canvas" description="Multiplayer whiteboards." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {canvasBoards.map((board) => (
          <Link key={board.id} href={`/canvas/${board.id}`}>
            <Card density="compact" className="hover:bg-mist-gray transition-colors h-full">
              <div className="text-body font-medium text-ink font-geist">{board.title}</div>
              <div className="text-body-sm text-fog mt-2">{board.courseTitle}</div>
              <div className="text-body-sm text-fog mt-1">
                {board.collaborators} collaborators · updated {board.updatedAt}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
