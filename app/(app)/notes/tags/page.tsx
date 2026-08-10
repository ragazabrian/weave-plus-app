import { notes } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { PillTag } from "@/components/ui/PillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function TagsPage() {
  const tagCounts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Tags" description="Browse notes by tag." />
      <Card>
        <div className="flex flex-wrap gap-3">
          {[...tagCounts.entries()].map(([tag, count]) => (
            <PillTag key={tag} wash="mint" label={`${tag} · ${count}`} />
          ))}
        </div>
      </Card>
    </div>
  );
}
