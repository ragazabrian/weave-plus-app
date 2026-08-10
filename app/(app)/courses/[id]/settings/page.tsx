import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function CourseSettingsPage({ params }: PageProps<"/courses/[id]/settings">) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={`${course.title} settings`} description="Course-level configuration." />
      <Card>
        <div className="text-body-sm text-fog">Course code</div>
        <div className="text-body text-ink font-geist mt-1">{course.code}</div>
      </Card>
      <Card>
        <div className="text-body-sm text-fog">Term</div>
        <div className="text-body text-ink font-geist mt-1">{course.term}</div>
      </Card>
    </div>
  );
}
