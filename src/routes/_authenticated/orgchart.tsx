import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, PageHeader, Pill } from "@/components/kit";
import { useRole } from "@/lib/session";
import { initialsOf } from "@/lib/course-color";

export const Route = createFileRoute("/_authenticated/orgchart")({
  head: () => ({
    meta: [
      { title: "Org chart | weave+" },
      {
        name: "description",
        content:
          "How the weave+ workspace is structured: admins, the lecturers who own each course and the students enrolled beneath them.",
      },
      { property: "og:title", content: "Org chart | weave+" },
      {
        property: "og:description",
        content: "Admins, lecturers and their cohorts in one reporting view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgChartPage,
});

type Person = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

function Node({ person, role, meta }: { person: Person; role: string; meta?: string }) {
  return (
    <div className="flex min-w-[220px] items-center gap-3 rounded-card-sm bg-graphite-surface p-3.5 hairline">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-blurple text-caption font-medium text-on-violet">
        {person.avatar ? (
          <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
        ) : (
          initialsOf(person.name)
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium text-snow-white">{person.name}</p>
        <p className="truncate text-caption text-slate">{meta ?? person.email}</p>
      </div>
      <Pill className="ml-auto shrink-0" tone={role === "Student" ? "mist" : "lavender"}>
        {role}
      </Pill>
    </div>
  );
}

function OrgChartPage() {
  const { role } = useRole();

  const data = useQuery({
    queryKey: ["orgchart"],
    queryFn: async () => {
      const [profiles, roles, courses, enrollments] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, avatar_url"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("courses").select("id, code, title, owner_id"),
        supabase.from("enrollments").select("user_id, course_id"),
      ]);
      return {
        profiles: profiles.data ?? [],
        roles: roles.data ?? [],
        courses: courses.data ?? [],
        enrollments: enrollments.data ?? [],
      };
    },
  });

  const chart = useMemo(() => {
    const d = data.data;
    if (!d) return null;
    const toPerson = (id: string | null): Person | null => {
      const p = d.profiles.find((x) => x.id === id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.full_name ?? p.email ?? "Member",
        email: p.email ?? "",
        avatar: p.avatar_url,
      };
    };

    const admins = d.roles
      .filter((r) => r.role === "admin")
      .map((r) => toPerson(r.user_id))
      .filter(Boolean) as Person[];

    const lecturerIds = d.roles.filter((r) => r.role === "lecturer").map((r) => r.user_id);

    const lecturers = lecturerIds
      .map((id) => {
        const person = toPerson(id);
        if (!person) return null;
        const owned = d.courses.filter((c) => c.owner_id === id);
        const cohort = new Set<string>();
        owned.forEach((course) => {
          d.enrollments
            .filter((e) => e.course_id === course.id)
            .forEach((e) => cohort.add(e.user_id));
        });
        return {
          person,
          courses: owned.map((c) => c.code),
          students: Array.from(cohort).map(toPerson).filter(Boolean) as Person[],
        };
      })
      .filter(Boolean) as {
      person: Person;
      courses: string[];
      students: Person[];
    }[];

    const claimed = new Set(lecturers.flatMap((l) => l.students.map((s) => s.id)));
    const unassigned = d.roles
      .filter((r) => r.role === "student" && !claimed.has(r.user_id))
      .map((r) => toPerson(r.user_id))
      .filter(Boolean) as Person[];

    return { admins, lecturers, unassigned };
  }, [data.data]);

  if (role === "student") {
    return (
      <div>
        <PageHeader title="Org chart" description="Staff only." />
        <EmptyState>The org chart is available to lecturers and admins.</EmptyState>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Org chart"
        description="Admins at the top, each lecturer with the courses they own, and the cohort sitting under them."
      />

      {data.isLoading || !chart ? (
        <EmptyState>Building the chart…</EmptyState>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-caption uppercase tracking-wide text-slate">
              Workspace admins
            </h2>
            <div className="flex flex-wrap gap-3">
              {chart.admins.length === 0 ? (
                <EmptyState>No admin assigned yet.</EmptyState>
              ) : (
                chart.admins.map((p) => <Node key={p.id} person={p} role="Admin" />)
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-caption uppercase tracking-wide text-slate">
              Lecturers and their cohorts
            </h2>
            <div className="flex flex-col gap-4">
              {chart.lecturers.length === 0 ? (
                <EmptyState>No lecturer owns a course yet.</EmptyState>
              ) : (
                chart.lecturers.map(({ person, courses, students }) => (
                  <div key={person.id} className="rounded-card bg-graphite-surface p-5 hairline">
                    <Node
                      person={person}
                      role="Lecturer"
                      meta={courses.length ? courses.join(", ") : person.email}
                    />
                    <div className="mt-4 ml-0 border-l border-border pl-4 md:ml-6">
                      <p className="mb-3 text-caption uppercase tracking-wide text-slate">
                        {students.length} in cohort
                      </p>
                      {students.length === 0 ? (
                        <p className="text-body-sm text-slate">Nobody enrolled yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {students.slice(0, 24).map((s) => (
                            <Node key={s.id} person={s} role="Student" />
                          ))}
                        </div>
                      )}
                      {students.length > 24 ? (
                        <p className="mt-3 text-caption text-slate">
                          and {students.length - 24} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {chart.unassigned.length ? (
            <section>
              <h2 className="mb-3 text-caption uppercase tracking-wide text-slate">
                Not yet under a lecturer
              </h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {chart.unassigned.slice(0, 24).map((p) => (
                  <Node key={p.id} person={p} role="Student" />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
