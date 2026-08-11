import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, FilledButton, GhostButton, PageHeader, Pill } from "@/components/kit";
import { COURSE_PRESETS, courseHex, courseWash, initialsOf, isHex } from "@/lib/course-color";
import { ColourPicker } from "@/components/course-colour-picker";
import teacherAvatar from "@/assets/brian-ragaza.png.asset.json";

const TEACHER_NAME = "Prof. Brian Ragaza";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({
    meta: [
      { title: "Courses | weave+" },
      {
        name: "description",
        content:
          "Every course you can see, colour coded, with its lecturer, modules, assignments and cohort size at a glance.",
      },
      { property: "og:title", content: "Courses | weave+" },
      {
        property: "og:description",
        content: "Course list scoped to your role: all, taught, or enrolled.",
      },
    ],
  }),
  component: CourseList,
});

function CourseList() {
  const { role } = useRole();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isStaff = role === "admin" || role === "lecturer";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    category: "powder" as (typeof COURSE_PRESETS)[number]["id"],
    color: COURSE_PRESETS[2].hex as string,
  });

  async function createCourse() {
    if (!user) return;
    if (!form.title.trim() || !form.code.trim()) {
      toast.error("A course needs a title and a code.");
      return;
    }
    if (!isHex(form.color)) {
      toast.error("That colour isn't a valid hex code.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: form.title.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        category: form.category,
        color: form.color,
        owner_id: user.id,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error("Could not create the course.");
      return;
    }
    toast.success("Course created");
    setOpen(false);
    setForm({
      title: "",
      code: "",
      description: "",
      category: "powder",
      color: COURSE_PRESETS[2].hex,
    });
    queryClient.invalidateQueries({ queryKey: ["courses-list"] });
    navigate({ to: "/courses/$courseId", params: { courseId: data.id } });
  }

  const courses = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const [courses, modules, assignments, enrollments] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, code, description, category, color, owner_id, starts_on, ends_on")
          .order("code"),
        supabase.from("modules").select("id, course_id"),
        supabase.from("assignments").select("id, course_id, due_at"),
        supabase.from("enrollments").select("course_id"),
      ]);
      if (courses.error) throw courses.error;
      const ownerIds = Array.from(
        new Set((courses.data ?? []).map((c) => c.owner_id).filter(Boolean)),
      ) as string[];
      const profiles = ownerIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", ownerIds)
        : { data: [] };
      return {
        courses: courses.data ?? [],
        modules: modules.data ?? [],
        assignments: assignments.data ?? [],
        enrollments: enrollments.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  const data = courses.data;

  return (
    <div>
      <PageHeader
        title="Courses"
        description={
          role === "admin"
            ? "Every course in the workspace."
            : role === "lecturer"
              ? "The courses you teach."
              : "The courses you're enrolled in."
        }
        action={
          isStaff ? (
            <FilledButton onClick={() => setOpen((v) => !v)} compact>
              {open ? "Close" : "New course"}
            </FilledButton>
          ) : undefined
        }
      />

      {isStaff && open ? (
        <Card className="mb-4" dense>
          <h2 className="text-subheading font-medium text-snow-white">New course</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Course title"
              className="min-w-0 rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline placeholder:text-slate"
            />
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Code, for example CS204"
              className="min-w-0 rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline placeholder:text-slate"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="What the course covers"
            className="mt-3 w-full resize-none rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline placeholder:text-slate"
          />

          <ColourPicker
            category={form.category}
            color={form.color}
            onChange={(next) => setForm({ ...form, ...next })}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <FilledButton onClick={createCourse} disabled={saving} compact>
              {saving ? "Creating…" : "Create course"}
            </FilledButton>
            <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
          </div>
        </Card>
      ) : null}

      {courses.isLoading ? (
        <EmptyState>Loading courses…</EmptyState>
      ) : (data?.courses.length ?? 0) === 0 ? (
        <EmptyState>No courses are visible to you yet.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data!.courses.map((course) => {
            const moduleCount = data!.modules.filter((m) => m.course_id === course.id).length;
            const courseAssignments = data!.assignments.filter((a) => a.course_id === course.id);
            const cohort = data!.enrollments.filter((e) => e.course_id === course.id).length;
            const nextDue = courseAssignments
              .map((a) => a.due_at)
              .filter((d): d is string => Boolean(d) && new Date(d!) > new Date())
              .sort()[0];
            const hex = courseHex(course);
            // Every course in this workspace is run by the same lecturer.
            const professor = TEACHER_NAME;
            const professorAvatar = teacherAvatar.url;

            return (
              <Link
                key={course.id}
                to="/courses/$courseId"
                params={{ courseId: course.id }}
                className="group/course flex h-full flex-col overflow-hidden rounded-card p-6 frost transition-all duration-300 ease-out hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${courseWash(hex, 0.32)}, ${courseWash(hex, 0.08)} 70%)`,
                  ["--course-hex" as string]: hex,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = hex;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = `linear-gradient(135deg, ${courseWash(hex, 0.32)}, ${courseWash(hex, 0.08)} 70%)`;
                }}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-caption uppercase tracking-widest text-slate group-hover/course:text-snow-white/80">
                      {course.code}
                    </p>
                    <h2 className="mt-1 font-display text-subheading font-medium text-snow-white">
                      {course.title}
                    </h2>
                  </div>

                  {/* Who runs the course, top right */}
                  <span
                    className="flex shrink-0 items-center gap-2 rounded-pill px-2 py-1 hairline"
                    title={`Teacher: ${professor}`}
                  >
                    {professorAvatar ? (
                      <img
                        src={professorAvatar}
                        alt={professor}
                        className="h-8 w-8 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-surface text-caption font-medium text-snow-white"
                      >
                        {initialsOf(professor)}
                      </span>
                    )}
                    <span className="hidden max-w-[120px] truncate text-caption text-smoke group-hover/course:text-snow-white sm:block">
                      {professor}
                    </span>
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-body text-ash group-hover/course:text-snow-white/90">
                  {course.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Pill>{moduleCount} modules</Pill>
                  <Pill>{courseAssignments.length} assignments</Pill>
                  <Pill>{cohort} enrolled</Pill>
                  {nextDue ? (
                    <Pill tone="solar">next due {new Date(nextDue).toLocaleDateString()}</Pill>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
