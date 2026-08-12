import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, PageHeader, Pill } from "@/components/kit";
import { useRole } from "@/lib/session";
import { initialsOf } from "@/lib/course-color";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/directory")({
  head: () => ({
    meta: [
      { title: "Directory | weave+" },
      {
        name: "description",
        content:
          "The full weave+ people directory: every member, their role, email and the courses they belong to.",
      },
      { property: "og:title", content: "Directory | weave+" },
      {
        property: "og:description",
        content: "Search and filter every member of the workspace by role and course.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DirectoryPage,
});

type RoleFilter = "all" | "admin" | "lecturer" | "student";

const ROLE_TABS: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All people" },
  { id: "admin", label: "Admin" },
  { id: "lecturer", label: "Lecturer" },
  { id: "student", label: "Student" },
];

const roleLabel = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);

function DirectoryPage() {
  const { role } = useRole();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<RoleFilter>("all");

  const data = useQuery({
    queryKey: ["directory"],
    queryFn: async () => {
      const [profiles, roles, enrollments, courses] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, avatar_url"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("enrollments").select("user_id, course_id"),
        supabase.from("courses").select("id, code, owner_id"),
      ]);
      return {
        profiles: profiles.data ?? [],
        roles: roles.data ?? [],
        enrollments: enrollments.data ?? [],
        courses: courses.data ?? [],
      };
    },
  });

  const people = useMemo(() => {
    const d = data.data;
    if (!d) return [];
    return d.profiles
      .map((p) => {
        const memberRole = d.roles.find((r) => r.user_id === p.id)?.role ?? "student";
        const enrolled = d.enrollments
          .filter((e) => e.user_id === p.id)
          .map((e) => d.courses.find((c) => c.id === e.course_id)?.code)
          .filter(Boolean) as string[];
        const teaching = d.courses.filter((c) => c.owner_id === p.id).map((c) => c.code);
        return {
          id: p.id,
          name: p.full_name ?? p.email ?? "Member",
          email: p.email ?? "",
          avatar: p.avatar_url,
          role: memberRole as string,
          courses: teaching.length ? teaching : enrolled,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.data]);

  const filtered = people.filter((p) => {
    if (tab !== "all" && p.role !== tab) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.courses.join(" ").toLowerCase().includes(q)
    );
  });

  if (role === "student") {
    return (
      <div>
        <PageHeader title="Directory" description="Staff only." />
        <EmptyState>The people directory is available to lecturers and admins.</EmptyState>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Directory"
        description="Every person in the workspace, with the role they hold and the courses they belong to."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex min-h-11 min-w-[240px] flex-1 items-center gap-2 rounded-ui bg-muted px-3 hairline">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            strokeWidth={1.8}
            className="shrink-0 text-slate"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, emails or course codes"
            aria-label="Search the directory"
            className="min-w-0 flex-1 bg-transparent text-body-sm text-snow-white outline-none placeholder:text-slate"
          />
        </div>
        <div
          role="tablist"
          aria-label="Filter by role"
          className="inline-flex rounded-pill bg-muted p-1 hairline"
        >
          {ROLE_TABS.map((option) => (
            <button
              key={option.id}
              role="tab"
              aria-selected={tab === option.id}
              onClick={() => setTab(option.id)}
              className={cn(
                "min-h-9 rounded-pill px-4 text-body-sm font-medium transition-colors",
                tab === option.id
                  ? "bg-blurple text-on-violet"
                  : "text-smoke hover:text-snow-white",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-card bg-graphite-surface hairline">
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_minmax(0,1.4fr)] gap-4 border-b border-border px-5 py-3 text-caption uppercase tracking-wide text-slate md:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Courses</span>
        </div>

        {data.isLoading ? (
          <p className="p-5 text-body-sm text-slate">Loading the directory…</p>
        ) : filtered.length === 0 ? (
          <p className="p-5 text-body-sm text-slate">No one matches that search.</p>
        ) : (
          filtered.map((person) => (
            <div
              key={person.id}
              className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_minmax(0,1.4fr)] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-blurple text-caption font-medium text-on-violet">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initialsOf(person.name)
                  )}
                </span>
                <span className="truncate text-body-sm font-medium text-snow-white">
                  {person.name}
                </span>
              </div>
              <a
                href={`mailto:${person.email}`}
                className="flex min-w-0 items-center gap-2 truncate text-body-sm text-smoke hover:text-snow-white"
              >
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={14}
                  strokeWidth={1.6}
                  className="shrink-0 text-slate md:hidden"
                />
                <span className="truncate">{person.email || "No email"}</span>
              </a>
              <span>
                <Pill tone={person.role === "student" ? "mist" : "lavender"}>
                  {roleLabel(person.role)}
                </Pill>
              </span>
              <span className="truncate text-body-sm text-slate">
                {person.courses.length ? person.courses.join(", ") : "No courses"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
