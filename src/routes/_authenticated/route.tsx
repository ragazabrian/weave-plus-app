import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { readDemoProfile } from "@/lib/demo-profile";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // The demo has no sign in, so a completed onboarding is enough to enter.
    const demo = readDemoProfile();
    if (demo) return { user: null };
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/onboarding" });
    return { user: data.user };
  },

  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
