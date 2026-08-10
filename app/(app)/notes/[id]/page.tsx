import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteById } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { PillTag } from "@/components/ui/PillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const note = getNoteById(id);
  if (!note) notFound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
      <div className="flex flex-col gap-6">
        <SectionHeader title={note.title} />
        <div className="flex gap-2">
          {note.tags.map((tag) => (
            <PillTag key={tag} wash="lavender" label={tag} />
          ))}
        </div>
        <Card>
          <p className="text-body text-ink font-geist leading-relaxed">{note.content}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card density="compact">
          <div className="text-body-sm font-medium text-ink font-geist mb-3">Backlinks</div>
          {note.backlinks.length === 0 && <div className="text-body-sm text-fog">No backlinks yet.</div>}
          <div className="flex flex-col gap-2">
            {note.backlinks.map((b) => (
              <Link key={b.id} href={`/notes/${b.id}`} className="text-body-sm text-sky-blue">
                {b.title}
              </Link>
            ))}
          </div>
        </Card>

        <Card density="compact">
          <div className="text-body-sm font-medium text-ink font-geist mb-3">Version history</div>
          <div className="flex flex-col gap-2">
            {note.versions.map((v) => (
              <div key={v.id} className="text-body-sm text-fog">
                {v.editedBy} · {v.editedAt}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
