"use client";

import { useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { Card } from "@/components/ui/Card";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { PillTag } from "@/components/ui/PillTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GhostButton } from "@/components/ui/Button";
import type { Course } from "@/lib/types";

type Tab = "home" | "announcements" | "modules" | "assignments" | "progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "announcements", label: "Announcements" },
  { id: "modules", label: "Modules" },
  { id: "assignments", label: "Assignments" },
  { id: "progress", label: "Progress" },
];

export function CourseDetail({ course }: { course: Course }) {
  const { role } = useRole();
  const [tab, setTab] = useState<Tab>("home");
  const canManage = role === "admin" || role === "lecturer";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title={course.title} description={`${course.code} · ${course.term}`} />
        {canManage && (
          <Link href={`/courses/${course.id}/settings`}>
            <GhostButton>Course settings</GhostButton>
          </Link>
        )}
      </div>

      <div className="flex gap-1 border-b border-mist-gray">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-body font-medium font-geist cursor-pointer border-b-2 -mb-px ${
              tab === t.id ? "border-ink text-ink" : "border-transparent text-fog"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <Card>
          <div className="text-body-sm text-fog">Overall progress</div>
          <div className="text-heading font-aeonik font-medium text-ink mt-1">{course.progressPct}%</div>
          <div className="w-full h-2 bg-mist-gray rounded-tags mt-4 overflow-hidden">
            <div className="h-full bg-charcoal rounded-tags" style={{ width: `${course.progressPct}%` }} />
          </div>
        </Card>
      )}

      {tab === "announcements" && (
        <div className="flex flex-col gap-4">
          {course.announcements.length === 0 && <Card density="compact">No announcements yet.</Card>}
          {course.announcements.map((a) => (
            <Card key={a.id} density="compact">
              <div className="flex items-center gap-2 mb-2">
                <PillTag wash={course.wash} label="Announcement" />
              </div>
              <div className="text-body font-medium text-ink font-geist">{a.title}</div>
              <div className="text-body-sm text-fog mt-1">{a.body}</div>
              <div className="text-caption text-fog mt-3">{a.author} · {a.postedAt}</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "modules" && (
        <Accordion>
          {course.modules.map((m) => (
            <AccordionItem key={m.id} title={m.title} subtitle={`${m.noteCount} notes`}>
              {m.summary}
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {tab === "assignments" && (
        <div className="flex flex-col gap-6">
          {course.assignments.length === 0 && <Card density="compact">No assignments yet.</Card>}
          {course.assignments.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <div className="text-subheading font-medium text-ink font-geist">{a.title}</div>
                <PillTag wash="solar" label={a.dueLabel} />
              </div>
              {canManage ? (
                <div className="mt-4 flex flex-col gap-2">
                  {a.submissions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-body-sm py-2 border-b border-mist-gray last:border-0">
                      <span className="text-ink font-geist">{s.studentName}</span>
                      <span className="text-fog">
                        {s.status === "graded" ? `Graded — ${s.grade}` : s.status === "submitted" ? "Submitted" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-body-sm text-fog">Submit your work before the due date.</div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "progress" && (
        <Card>
          <div className="text-body-sm text-fog">{canManage ? "Gradebook summary" : "My progress"}</div>
          <div className="text-heading font-aeonik font-medium text-ink mt-1">{course.progressPct}%</div>
        </Card>
      )}
    </div>
  );
}
