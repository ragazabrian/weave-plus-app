import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole, type AppRole } from "@/lib/session";
import { inviteMember, setMemberRole } from "@/lib/members.functions";
import { Card, EmptyState, FilledButton, GhostButton, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Members | weave+" },
      { name: "description", content: "The workspace roster and each member's role." },
      { property: "og:title", content: "Members | weave+" },
      { property: "og:description", content: "Manage who is in the workspace." },
    ],
  }),
  component: Members,
});

const ROLES: AppRole[] = ["admin", "lecturer", "student"];

const PERMISSIONS: { label: string; admin: boolean; lecturer: boolean; student: boolean }[] = [
  { label: "Invite members and set roles", admin: true, lecturer: false, student: false },
  { label: "Create and archive courses", admin: true, lecturer: true, student: false },
  { label: "Grade submissions", admin: true, lecturer: true, student: false },
  { label: "Post announcements", admin: true, lecturer: true, student: false },
  { label: "Read the agent activity log", admin: true, lecturer: true, student: false },
  { label: "Write personal notes and canvases", admin: true, lecturer: true, student: true },
];

function Members() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const isAdmin = role === "admin";

  const invite = useServerFn(inviteMember);
  const assignRole = useServerFn(setMemberRole);

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("student");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const data = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const [profiles, roles, enrollments, courses] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("enrollments").select("user_id, course_id"),
        supabase.from("courses").select("id, code, title"),
      ]);
      if (profiles.error) throw profiles.error;
      return {
        profiles: profiles.data ?? [],
        roles: roles.data ?? [],
        enrollments: enrollments.data ?? [],
        courses: courses.data ?? [],
      };
    },
  });

  async function setRole(userId: string, next: AppRole) {
    const result = await assignRole({ data: { userId, role: next } });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Role updated");
    queryClient.invalidateQueries({ queryKey: ["members"] });
  }

  async function submitInvite() {
    if (!email.trim()) {
      toast.error("Add an email address first.");
      return;
    }
    setSending(true);
    try {
      const result = await invite({
        data: { email: email.trim(), role: inviteRole, courseIds },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.existed
          ? "That person already had an account, so their access was updated."
          : "Invite sent",
      );
      setEmail("");
      setCourseIds([]);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch {
      toast.error("Could not send the invite.");
    } finally {
      setSending(false);
    }
  }

  function toggleCourse(id: string) {
    setCourseIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  return (
    <div>
      <PageHeader
        title="Members"
        description={
          isAdmin
            ? "Everyone in the workspace, with their role and enrolments."
            : "People in the courses you teach."
        }
      />

      {isAdmin ? (
        <Card className="mb-4" dense>
          <h2 className="text-subheading font-medium text-ink">Add a member</h2>
          <p className="mt-1 text-body-sm text-fog">
            They get an email invite. Their role and course access apply the moment they sign in.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="min-w-0 rounded-input bg-mist-gray px-4 py-3 text-body text-ink outline-none placeholder:text-fog"
            />
            <div className="flex flex-wrap gap-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInviteRole(r)}
                  aria-pressed={inviteRole === r}
                >
                  <Pill tone={inviteRole === r ? "lavender" : "mist"}>{r}</Pill>
                </button>
              ))}
            </div>
          </div>

          {(data.data?.courses ?? []).length > 0 ? (
            <div className="mt-4">
              <p className="text-caption uppercase tracking-widest text-fog">Course access</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.data!.courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourse(c.id)}
                    aria-pressed={courseIds.includes(c.id)}
                  >
                    <Pill tone={courseIds.includes(c.id) ? "lavender" : "mist"}>{c.code}</Pill>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <FilledButton onClick={submitInvite} disabled={sending} compact>
              {sending ? "Sending…" : "Send invite"}
            </FilledButton>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2">
        {data.isLoading ? (
          <EmptyState>Loading roster…</EmptyState>
        ) : (data.data?.profiles ?? []).length === 0 ? (
          <EmptyState>No members visible to you.</EmptyState>
        ) : (
          data.data!.profiles.map((profile) => {
            const theirRoles = data
              .data!.roles.filter((r) => r.user_id === profile.id)
              .map((r) => r.role as AppRole);
            const primary = theirRoles.includes("admin")
              ? "admin"
              : theirRoles.includes("lecturer")
                ? "lecturer"
                : "student";
            const codes = data
              .data!.enrollments.filter((e) => e.user_id === profile.id)
              .map((e) => data.data!.courses.find((c) => c.id === e.course_id)?.code ?? "")
              .filter(Boolean);
            return (
              <div
                key={profile.id}
                className="grid grid-cols-[minmax(0,1fr)] items-center gap-3 rounded-card-sm bg-bone-white p-4 sm:flex sm:flex-wrap sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-ink">
                    {profile.full_name ?? profile.email ?? "Member"}
                  </p>
                  <p className="mt-1 truncate text-body-sm text-fog">
                    {profile.email}
                    {codes.length ? ` · ${codes.join(", ")}` : ""}
                  </p>
                </div>
                {isAdmin ? (
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(profile.id, r)}
                        aria-pressed={primary === r}
                      >
                        <Pill tone={primary === r ? "lavender" : "mist"}>{r}</Pill>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Pill tone="lavender">{primary}</Pill>
                )}
              </div>
            );
          })
        )}
      </div>

      <Card className="mt-6" dense>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-subheading font-medium text-ink">Permissions</h2>
          <GhostButton disabled>Role based, not editable per person</GhostButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="text-caption uppercase tracking-widest text-fog">
                <th className="py-2 pr-4 font-medium">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="py-2 pr-4 font-medium">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="py-3 pr-4 text-body-sm text-graphite">{row.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="py-3 pr-4 text-body-sm text-ink">
                      {row[r] ? "Yes" : "No"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
