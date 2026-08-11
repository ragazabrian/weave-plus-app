import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useViewRole } from "@/lib/view-role";
import { useDemoProfile } from "@/lib/demo-profile";

export type AppRole = "admin" | "lecturer" | "student";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useRole() {
  const { user } = useSession();
  const { viewRole } = useViewRole();
  const { profile: demo } = useDemoProfile();
  const query = useQuery({
    queryKey: ["role", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<AppRole> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      if (roles.includes("admin")) return "admin";
      if (roles.includes("lecturer")) return "lecturer";
      return "student";
    },
  });

  // Demo mode: onboarding decides the role, there is no account to read from.
  const actualRole = user ? (query.data ?? null) : (demo?.role ?? null);
  // Admins can preview the workspace as another role. Reads stay filtered by
  // the database, so this only narrows what the interface offers.
  const role = actualRole === "admin" && viewRole ? viewRole : actualRole;

  return {
    role,
    actualRole,
    isLoading: user ? query.isLoading : false,
    user,
  };
}

export function useProfile() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function displayName(user: User | null, fullName?: string | null) {
  return fullName || user?.email?.split("@")[0] || "there";
}
