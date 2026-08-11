import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";

import { supabase } from "@/integrations/supabase/client";
import { getPriorityFeed } from "@/lib/agent.functions";
import { useProfile, useRole, useSession, displayName } from "@/lib/session";
import { useDemoProfile, demoFullName } from "@/lib/demo-profile";
import { FixedComposer } from "@/components/fixed-composer";
import coursesArt from "@/assets/courses-3d.png.asset.json";
import gradingArt from "@/assets/grading-3d.png.asset.json";
import notesArt from "@/assets/notes-3d.png.asset.json";
import graduationArt from "@/assets/graduation-3d.png.asset.json";
import calendarArt from "@/assets/calendar-3d.png.asset.json";
import announcementsArt from "@/assets/announcements-3d.png.asset.json";
import {
  HeroBanner,
  StatTile,
  StatTileRow,
  PanelRow,
  Panel,
  PanelItem,
  TableSection,
  TableRow,
  TableCell,
  Tag,
} from "@/components/sections";

/** Small 3D illustration used in the stat tiles and panel headers. */
function Art({ src, alt, size = 44 }: { src: string; alt: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 object-contain drop-shadow-none"
      style={{ width: size, height: size }}
    />
  );
}

function relative(iso: string | null) {
  if (!iso) return "no date";
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diff / 3_600_000);
  if (Math.abs(hours) < 24)
    return hours >= 0 ? `in ${Math.max(hours, 1)}h` : `${Math.abs(hours)}h ago`;
  const days = Math.round(hours / 24);
  return days >= 0 ? `in ${days}d` : `${Math.abs(days)}d ago`;
}

const SUGGESTIONS = [
  "What should I work on next?",
  "Summarise my notes from this week",
  "Draft an announcement for my course",
  "Which deadlines are at risk?",
];

const STUDENT_SUGGESTIONS = [
  "What should I study next?",
  "Summarise my notes from this week",
  "Which deadlines are at risk?",
  "Explain this module in simple terms",
];

/** Chat entry, fixed to the bottom of the viewport. */
function BottomChatBar({ locked, suggestions }: { locked: boolean; suggestions: string[] }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");

  function start(message: string) {
    const q = message.trim();
    if (!q || locked) return;
    navigate({ to: "/agent", search: { q } });
  }

  return (
    <FixedComposer>
      <div className="rounded-card bg-graphite-surface/90 p-3 backdrop-blur-xl hairline">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => start(s)}
              disabled={locked}
              className="min-h-9 shrink-0 rounded-pill bg-muted px-3.5 py-1.5 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white disabled:cursor-not-allowed disabled:text-slate disabled:hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                start(draft);
              }
            }}
            rows={2}
            disabled={locked}
            aria-label="Ask the agent"
            placeholder={
              locked
                ? "The agent is a PRO feature in this plan"
                : "Ask anything, or start a new chat…"
            }
            className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-body text-snow-white outline-none placeholder:text-slate"
          />
          <button
            onClick={() => start(draft)}
            disabled={!draft.trim() || locked}
            aria-label="Start chat"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-snow-white text-graphite-surface transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:bg-slate"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </FixedComposer>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/25",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Low: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

function deadlinePriority(dueAt: string | null) {
  if (!dueAt) return "Low";
  const hours = (new Date(dueAt).getTime() - Date.now()) / 3_600_000;
  if (hours < 24) return "Critical";
  if (hours < 72) return "High";
  if (hours < 168) return "Medium";
  return "Low";
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-caption font-semibold uppercase tracking-wide ${PRIORITY_COLORS[priority] ?? PRIORITY_COLORS["Low"]}`}
    >
      {priority}
    </span>
  );
}

function ShelfCard({
  title,
  meta,
  to,
  params,
  priority,
}: {
  title: string;
  meta: string;
  to: string;
  params?: Record<string, string>;
  priority?: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="group relative flex w-[248px] shrink-0 snap-start flex-col justify-between rounded-card p-5 frost transition-colors hover:bg-muted sm:w-[280px]"
    >
      <div>
        <p className="line-clamp-2 text-body-lg font-semibold leading-snug text-snow-white">
          {title}
        </p>
        {priority ? (
          <div className="mt-3">
            <PriorityBadge priority={priority} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        <p className="truncate text-caption text-slate">{meta}</p>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={15}
          strokeWidth={1.6}
          className="shrink-0 text-slate transition-colors group-hover:text-snow-white"
        />
      </div>
    </Link>
  );
}

function ShelfEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="w-[248px] shrink-0 snap-start rounded-card p-5 frost sm:w-[280px]">
      <p className="text-body-sm text-slate">{children}</p>
    </div>
  );
}

/**
 * The workspace dashboard. `studentMode` renders the same layout scoped to a
 * student: no grading queue, and the agent entry reads as a locked PRO feature.
 */
export function DashboardView({ studentMode = false }: { studentMode?: boolean }) {
  const { role } = useRole();
  const { user } = useSession();
  const { data: profile } = useProfile();
  const { profile: demo } = useDemoProfile();
  const isStaff = !studentMode && (role === "admin" || role === "lecturer");

  const name = demo ? demoFullName(demo) : displayName(user, profile?.full_name);

  const priorityFn = useServerFn(getPriorityFeed);
  const priority = useQuery({
    queryKey: ["priority-feed", role, studentMode],
    enabled: Boolean(role) && !studentMode,
    staleTime: 5 * 60 * 1000,
    queryFn: () => priorityFn({}),
  });

  const overview = useQuery({
    queryKey: ["dashboard-overview", user?.id, role, studentMode],
    queryFn: async () => {
      const [courses, assignments, submissions, notes, announcements] = await Promise.all([
        supabase.from("courses").select("id, title, code"),
        supabase.from("assignments").select("id, course_id, title, due_at"),
        supabase
          .from("submissions")
          .select("id, assignment_id, user_id, status, grade, submitted_at"),
        supabase
          .from("notes")
          .select("id, title, updated_at, tags")
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("announcements")
          .select("id, course_id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(4),
      ]);
      return {
        courses: courses.data ?? [],
        assignments: assignments.data ?? [],
        submissions: submissions.data ?? [],
        notes: notes.data ?? [],
        announcements: announcements.data ?? [],
      };
    },
  });

  const data = overview.data;
  const courseCode = (id: string) => data?.courses.find((c) => c.id === id)?.code ?? "";

  const myOpen = (data?.assignments ?? [])
    .filter((a) => {
      const mine = data?.submissions.find(
        (s) => s.assignment_id === a.id && s.user_id === user?.id,
      );
      return !mine || mine.status === "draft";
    })
    .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))
    .slice(0, 6);

  const awaitingGrading = (data?.submissions ?? [])
    .filter((s) => s.status === "submitted")
    .sort((a, b) => (a.submitted_at ?? "").localeCompare(b.submitted_at ?? ""))
    .slice(0, 6);

  const upcoming = (data?.assignments ?? [])
    .filter((a) => a.due_at && new Date(a.due_at).getTime() > Date.now())
    .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))
    .slice(0, 5);

  const lessons = (data?.assignments ?? []).slice(0, 6);

  return (
    <div>
      <HeroBanner
        eyebrow={studentMode ? "student workspace" : `${role ?? "loading"} workspace`}
        title={`Good to see you, ${name}`}
        body={
          studentMode
            ? "Your courses, notes and deadlines in one place. Some workspace tools are part of the PRO plan."
            : (priority.data?.items?.[0]?.why ??
              "Your courses, notes and deadlines in one place. Ask the agent when you are unsure where to start.")
        }
        cta={
          studentMode
            ? { label: "Open your courses", to: "/courses" }
            : {
                label: "Ask the agent",
                to: "/agent",
                search: {
                  q: priority.data?.items?.[0]?.title ?? "What should I work on next?",
                },
              }
        }
      />

      <StatTileRow>
        <StatTile
          icon={<Art src={coursesArt.url} alt="" />}
          meta={`${data?.courses.length ?? 0} active`}
          label={studentMode || role === "student" ? "Enrolled courses" : "Courses"}
          to="/courses"
        />
        <StatTile
          icon={<Art src={gradingArt.url} alt="" />}
          meta={`${isStaff ? awaitingGrading.length : myOpen.length} open`}
          label={isStaff ? "Awaiting grading" : "Assignments"}
          to="/calendar"
        />
        <StatTile
          icon={<Art src={notesArt.url} alt="" />}
          meta={`${data?.notes.length ?? 0} recent`}
          label="Notes in reach"
          to="/notes"
        />
        <StatTile
          icon={<Art src={calendarArt.url} alt="" />}
          meta={`${upcoming.length} scheduled`}
          label="Coming up"
          to="/calendar"
        />
        <StatTile
          icon={<Art src={announcementsArt.url} alt="" />}
          meta={`${data?.announcements.length ?? 0} new`}
          label="Announcements"
          to="/courses"
        />
        {studentMode ? (
          <StatTile
            icon={<Art src={graduationArt.url} alt="" />}
            meta="all courses"
            label="Your schedule"
            to="/calendar"
          />
        ) : (
          <StatTile
            icon={<Art src={graduationArt.url} alt="" />}
            meta="link map"
            label="Note graph"
            to="/notes/graph"
          />
        )}
      </StatTileRow>

      <PanelRow>
        <Panel
          title={isStaff ? "Awaiting your grading" : "Assigned to you"}
          subtitle={
            isStaff
              ? "Submissions waiting on your feedback."
              : "Stay organized and get things done."
          }
          action={
            <Link
              to="/calendar"
              className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-pill bg-muted px-3.5 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
            >
              View schedule
            </Link>
          }
          footer={`${isStaff ? awaitingGrading.length : myOpen.length} in progress`}
        >
          {isStaff ? (
            awaitingGrading.length === 0 ? (
              <PanelItem title="No submissions waiting on feedback." />
            ) : (
              awaitingGrading.map((s) => {
                const assignment = data?.assignments.find((a) => a.id === s.assignment_id);
                return (
                  <PanelItem
                    key={s.id}
                    code={courseCode(assignment?.course_id ?? "")}
                    title={assignment?.title ?? "Submission"}
                    meta={`submitted ${relative(s.submitted_at)}`}
                    to="/courses/$courseId/assignments/$assignmentId"
                    params={{
                      courseId: assignment?.course_id ?? "",
                      assignmentId: s.assignment_id,
                    }}
                  />
                );
              })
            )
          ) : myOpen.length === 0 ? (
            <PanelItem title="Nothing outstanding. Enjoy it." />
          ) : (
            myOpen.map((a) => (
              <PanelItem
                key={a.id}
                code={courseCode(a.course_id)}
                title={a.title}
                meta={`due ${relative(a.due_at)}`}
                to="/courses/$courseId/assignments/$assignmentId"
                params={{ courseId: a.course_id, assignmentId: a.id }}
              />
            ))
          )}
        </Panel>

        <Panel
          title="Coming up"
          subtitle="Your upcoming deadlines at a glance."
          scroll="horizontal"
          width="lg"
          footer={`${upcoming.length} scheduled`}
        >
          {upcoming.length === 0 ? (
            <ShelfEmpty>No deadlines ahead.</ShelfEmpty>
          ) : (
            upcoming.map((a) => (
              <ShelfCard
                key={a.id}
                title={a.title}
                meta={`${courseCode(a.course_id)} · ${relative(a.due_at)}`}
                priority={deadlinePriority(a.due_at)}
                to="/courses/$courseId/assignments/$assignmentId"
                params={{ courseId: a.course_id, assignmentId: a.id }}
              />
            ))
          )}
        </Panel>

        <Panel
          title="Continue editing"
          subtitle="Notes you touched most recently."
          footer={`${data?.notes.length ?? 0} recent notes`}
          action={
            studentMode ? (
              <span className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-pill bg-muted px-3.5 text-caption font-medium text-slate hairline">
                Graph view
                <span className="rounded-pill bg-blurple px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-violet">
                  Pro
                </span>
              </span>
            ) : (
              <Link
                to="/notes/graph"
                className="inline-flex min-h-9 shrink-0 items-center rounded-pill bg-muted px-3.5 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
              >
                Graph view
              </Link>
            )
          }
        >
          {(data?.notes ?? []).length === 0 ? (
            <PanelItem title="No notes yet." />
          ) : (
            data!.notes.map((note) => (
              <PanelItem
                key={note.id}
                title={note.title}
                meta={`edited ${relative(note.updated_at)}`}
                to="/notes/$noteId"
                params={{ noteId: note.id }}
              />
            ))
          )}
        </Panel>

        <Panel
          title="Announcements"
          subtitle="Latest news from your courses."
          footer="Showing the last 7 days"
        >
          {(data?.announcements ?? []).length === 0 ? (
            <PanelItem title="No announcements posted." />
          ) : (
            data!.announcements.map((item) => (
              <PanelItem
                key={item.id}
                code={courseCode(item.course_id)}
                title={item.title}
                meta={relative(item.created_at)}
                to="/courses/$courseId/announcements"
                params={{ courseId: item.course_id }}
              />
            ))
          )}
        </Panel>
      </PanelRow>

      <TableSection
        title={studentMode ? "Your coursework" : "Your work"}
        columns={["Course", "Type", "Title", "Due", "Action"]}
        action={
          <Link
            to="/courses"
            className="text-caption font-medium text-bone underline underline-offset-4 transition-colors hover:text-snow-white"
          >
            See all
          </Link>
        }
      >
        {lessons.length === 0 ? (
          <TableRow>
            <TableCell className="text-slate">Nothing scheduled yet.</TableCell>
            <TableCell> </TableCell>
            <TableCell> </TableCell>
            <TableCell> </TableCell>
            <TableCell> </TableCell>
          </TableRow>
        ) : (
          lessons.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium text-snow-white">
                {courseCode(a.course_id) || "Course"}
              </TableCell>
              <TableCell>
                <Tag>Assignment</Tag>
              </TableCell>
              <TableCell className="max-w-[280px] truncate">{a.title}</TableCell>
              <TableCell className="text-slate">{relative(a.due_at)}</TableCell>
              <TableCell>
                <Link
                  to="/courses/$courseId/assignments/$assignmentId"
                  params={{ courseId: a.course_id, assignmentId: a.id }}
                  aria-label={`Open ${a.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-pill bg-muted text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableSection>

      <BottomChatBar
        locked={studentMode}
        suggestions={studentMode ? STUDENT_SUGGESTIONS : SUGGESTIONS}
      />
    </div>
  );
}
