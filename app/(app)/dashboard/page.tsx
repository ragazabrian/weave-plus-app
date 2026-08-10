"use client";

import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Card } from "@/components/ui/Card";
import { SeverityPill } from "@/components/ui/PillTag";
import { GhostButton } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  statsByRole,
  priorityFeedByRole,
  recentNotesByRole,
  assignedByRole,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const { role } = useRole();
  const stats = statsByRole[role];
  const feed = priorityFeedByRole[role];
  const recentNotes = recentNotesByRole[role];
  const assigned = assignedByRole[role];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader title="Dashboard" description="Here's what needs your attention today." />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <MetricBlock key={s.id} label={s.label} value={s.value} />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-subheading font-geist font-medium text-ink">Priority feed</h2>
          <GhostButton>Refresh all</GhostButton>
        </div>
        <div className="flex flex-col gap-3">
          {feed.map((item) => (
            <Link key={item.id} href={item.href}>
              <Card density="compact" className="flex items-start gap-4 hover:bg-mist-gray transition-colors">
                <SeverityPill severity={item.severity} />
                <div>
                  <div className="text-body font-medium text-ink font-geist">{item.title}</div>
                  <div className="text-body-sm text-fog mt-1">{item.reason}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-subheading font-geist font-medium text-ink">Continue editing</h2>
          {recentNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card density="compact" className="hover:bg-mist-gray transition-colors">
                <div className="text-body font-medium text-ink font-geist">{note.title}</div>
                <div className="text-body-sm text-fog mt-1">Updated {note.updatedAt}</div>
              </Card>
            </Link>
          ))}
        </div>

        {assigned.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-subheading font-geist font-medium text-ink">
              {role === "student" ? "Assigned to you" : "Awaiting your grading"}
            </h2>
            {assigned.map((item) => (
              <Link key={item.id} href={item.href}>
                <Card density="compact" className="hover:bg-mist-gray transition-colors">
                  <div className="text-body font-medium text-ink font-geist">{item.title}</div>
                  <div className="text-body-sm text-fog mt-1">
                    {item.courseTitle} · {item.dueLabel}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
