"use client";

import { useRole } from "@/lib/role-context";
import { Card } from "@/components/ui/Card";
import { PillTag } from "@/components/ui/PillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { members } from "@/lib/mock-data";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", lecturer: "Lecturer", student: "Student" };

export default function MembersPage() {
  const { role } = useRole();

  if (role === "student") {
    return (
      <div className="flex flex-col gap-8">
        <SectionHeader title="Members" />
        <Card>This page isn&apos;t available for students.</Card>
      </div>
    );
  }

  const OWNED_COURSE_CODES = ["CS101", "CS204"];
  const list =
    role === "lecturer"
      ? members.filter((m) => m.courses.some((c) => OWNED_COURSE_CODES.includes(c)))
      : members;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Members"
        description={role === "admin" ? "Full workspace roster." : "Roster for the courses you teach."}
      />
      <div className="flex flex-col gap-3">
        {list.map((m) => (
          <Card key={m.id} density="compact" className="flex items-center justify-between">
            <div className="text-body text-ink font-geist">{m.name}</div>
            <PillTag wash="powder" label={ROLE_LABEL[m.role]} />
          </Card>
        ))}
      </div>
    </div>
  );
}
