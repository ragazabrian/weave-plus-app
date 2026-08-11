import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/people")({
  head: () => ({
    meta: [
      { title: "People | weave+" },
      {
        name: "description",
        content: "Everyone enrolled in this course, with lecturers and students separated.",
      },
      { property: "og:title", content: "People | weave+" },
      {
        property: "og:description",
        content: "The course roster: teaching staff first, then the enrolled cohort.",
      },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const { courseId } = Route.useParams();

  const data = useQuery({
    queryKey: ["course-people", courseId],
    queryFn: async () => {
      const [course, enrollments] = await Promise.all([
        supabase.from("courses").select("owner_id").eq("id", courseId).maybeSingle(),
        supabase.from("enrollments").select("user_id, created_at").eq("course_id", courseId),
      ]);
      const ids = Array.from(
        new Set([
          ...(enrollments.data ?? []).map((e) => e.user_id),
          ...(course.data?.owner_id ? [course.data.owner_id] : []),
        ]),
      );
      const [profiles, roles] = await Promise.all([
        ids.length
          ? supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", ids)
          : Promise.resolve({ data: [] as never[] }),
        ids.length
          ? supabase.from("user_roles").select("user_id, role").in("user_id", ids)
          : Promise.resolve({ data: [] as never[] }),
      ]);
      return {
        ownerId: course.data?.owner_id ?? null,
        enrollments: enrollments.data ?? [],
        profiles: (profiles.data ?? []) as {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
        }[],
        roles: (roles.data ?? []) as { user_id: string; role: string }[],
      };
    },
  });

  if (data.isLoading) return <EmptyState>Loading the roster…</EmptyState>;

  const d = data.data!;
  const roleOf = (id: string) => {
    const held = d.roles.filter((r) => r.user_id === id).map((r) => r.role);
    if (held.includes("admin")) return "admin";
    if (held.includes("lecturer")) return "lecturer";
    return "student";
  };
  const staff = d.profiles.filter((p) => p.id === d.ownerId || roleOf(p.id) !== "student");
  const students = d.profiles.filter((p) => !staff.some((s) => s.id === p.id));

  function Row({ person, detail }: { person: (typeof d.profiles)[number]; detail: string }) {
    return (
      <div className="flex items-center gap-3 rounded-card-sm bg-muted p-4 hairline">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-graphite-surface text-body-sm font-medium text-snow-white hairline">
          {person.avatar_url ? (
            <img
              src={person.avatar_url}
              alt={`${person.full_name ?? person.email ?? "Member"} avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            (person.full_name || person.email || "?").slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm font-medium text-snow-white">
            {person.full_name || person.email}
          </span>
          <span className="block truncate text-caption text-slate">{detail}</span>
        </span>
        <Pill>{roleOf(person.id)}</Pill>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title="People"
          description="Roles come from the workspace, enrolment decides who sees the course."
        />
        <div className="flex flex-wrap gap-2">
          <Pill>{staff.length} teaching</Pill>
          <Pill>{students.length} enrolled</Pill>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-body font-medium text-snow-white">Teaching team</h2>
        <div className="flex flex-col gap-2">
          {staff.length === 0 ? (
            <EmptyState>No lecturer assigned yet.</EmptyState>
          ) : (
            staff.map((person) => (
              <Row
                key={person.id}
                person={person}
                detail={person.id === d.ownerId ? "Course owner" : (person.email ?? "")}
              />
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-body font-medium text-snow-white">Students</h2>
        <div className="flex flex-col gap-2">
          {students.length === 0 ? (
            <EmptyState>Nobody enrolled yet.</EmptyState>
          ) : (
            students.map((person) => {
              const enrolment = d.enrollments.find((e) => e.user_id === person.id);
              return (
                <Row
                  key={person.id}
                  person={person}
                  detail={
                    enrolment
                      ? `enrolled ${new Date(enrolment.created_at).toLocaleDateString()}`
                      : (person.email ?? "")
                  }
                />
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
