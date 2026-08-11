import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRole, useSession } from "@/lib/session";
import { Card, FilledButton, PageHeader, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/profile")({
  head: () => ({
    meta: [
      { title: "Profile | weave+" },
      {
        name: "description",
        content:
          "Your weave+ profile: display name, avatar and the role you hold in the workspace.",
      },
      { property: "og:title", content: "Profile | weave+" },
      {
        property: "og:description",
        content: "Update your display name and avatar, and review your workspace role.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const { role, actualRole } = useRole();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile?.full_name, profile?.avatar_url]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, avatar_url: avatarUrl || null })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        title="Profile"
        description="How your name and picture appear across courses, discussions and the inbox."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-caption uppercase tracking-wide text-slate">Display name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                className="min-h-11 rounded-ui bg-muted px-3 text-body-sm text-snow-white hairline placeholder:text-slate"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-caption uppercase tracking-wide text-slate">Avatar URL</span>
              <input
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://"
                className="min-h-11 rounded-ui bg-muted px-3 text-body-sm text-snow-white hairline placeholder:text-slate"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-caption uppercase tracking-wide text-slate">Email</span>
              <input
                value={user?.email ?? ""}
                readOnly
                className="min-h-11 rounded-ui bg-muted px-3 text-body-sm text-slate hairline"
              />
            </label>
            <FilledButton type="submit" compact disabled={save.isPending} className="self-start">
              {save.isPending ? "Saving…" : "Save profile"}
            </FilledButton>
          </form>
        </Card>

        <Card dense>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-pill bg-muted text-body font-medium text-snow-white hairline">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
              ) : (
                (fullName || user?.email || "?").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-snow-white">
                {fullName || user?.email}
              </p>
              <p className="text-caption text-slate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill>{role ?? "loading"}</Pill>
            {actualRole && role !== actualRole ? <Pill>previewing</Pill> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
