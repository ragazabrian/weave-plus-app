import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/mock-data";
import { CourseDetail } from "@/components/course/CourseDetail";

export default async function CoursePage({ params }: PageProps<"/courses/[id]">) {
  const { id } = await params;
  const course = getCourseById(id);
  if (!course) notFound();

  return <CourseDetail course={course} />;
}
