import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RoleEnum = z.enum(["admin", "lecturer", "student"]);

const InviteInput = z.object({
  email: z.string().email().max(320),
  role: RoleEnum,
  courseIds: z.array(z.string().uuid()).max(50).default([]),
});

const RoleInput = z.object({
  userId: z.string().uuid(),
  role: RoleEnum,
});

/**
 * Invites a workspace member and assigns their role. Role rows have no client
 * write policies on purpose, so every mutation here re-verifies that the caller
 * is an admin through their own RLS-scoped client before touching admin APIs.
 */
export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InviteInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
      return { ok: false as const, error: "Only workspace admins can invite members." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();

    let memberId = existing?.id ?? null;

    if (!memberId) {
      const invited = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: { requested_role: data.role },
      });
      if (invited.error || !invited.data.user) {
        return {
          ok: false as const,
          error: invited.error?.message ?? "Could not send the invite.",
        };
      }
      memberId = invited.data.user.id;
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", memberId);
    const roleWrite = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: memberId, role: data.role });
    if (roleWrite.error) {
      return { ok: false as const, error: "Invited, but the role could not be set." };
    }

    if (data.courseIds.length > 0) {
      await supabaseAdmin.from("enrollments").upsert(
        data.courseIds.map((course_id) => ({ course_id, user_id: memberId! })),
        { onConflict: "course_id,user_id" },
      );
    }

    return {
      ok: true as const,
      existed: Boolean(existing),
      userId: memberId,
    };
  });

/** Reassigns a member's role. Admin only, verified server side. */
export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RoleInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: callerRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
      return { ok: false as const, error: "Only workspace admins can change roles." };
    }

    if (data.userId === userId && data.role !== "admin") {
      return { ok: false as const, error: "You cannot remove your own admin role." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });

    if (error) return { ok: false as const, error: "Could not assign the new role." };
    return { ok: true as const };
  });
