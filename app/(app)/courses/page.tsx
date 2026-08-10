"use client";

import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { PastelTile } from "@/components/ui/PastelTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { coursesForRole } from "@/lib/mock-data";

export default function CoursesPage() {
  const { role } = useRole();
  const list = coursesForRole(role);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Courses"
        description={
          role === "admin"
            ? "All courses across the workspace."
            : role === "lecturer"
              ? "Courses you teach."
              : "Courses you're enrolled in."
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <PastelTile wash={course.wash} className="h-full hover:opacity-90 transition-opacity">
              <div className="text-body-sm text-graphite font-geist">{course.code} · {course.term}</div>
              <div className="text-heading-sm font-aeonik font-medium text-ink mt-2">{course.title}</div>
              <div className="text-body-sm text-graphite font-geist mt-4">{course.progressPct}% complete</div>
            </PastelTile>
          </Link>
        ))}
      </div>
    </div>
  );
}
