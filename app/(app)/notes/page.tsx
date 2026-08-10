import Link from "next/link";
import { notes } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { PillTag } from "@/components/ui/PillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GhostButton } from "@/components/ui/Button";

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Notes" description="Your linked-notes vault." />
        <div className="flex gap-2">
          <Link href="/notes/graph">
            <GhostButton>Graph view</GhostButton>
          </Link>
          <Link href="/notes/tags">
            <GhostButton>Tags</GhostButton>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <Card density="compact" className="hover:bg-mist-gray transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-body font-medium text-ink font-geist">{note.title}</div>
                <div className="text-caption text-fog">Updated {note.updatedAt}</div>
              </div>
              <div className="flex gap-2 mt-3">
                {note.tags.map((tag) => (
                  <PillTag key={tag} wash="lavender" label={tag} />
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
