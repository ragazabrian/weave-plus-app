import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  UserIcon,
  KeyboardIcon,
  Moon02Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRole, useSession } from "@/lib/session";
import { useTheme, type Theme } from "@/lib/theme";
import { createLocalStore } from "@/lib/local-store";
import { useAnalyticsConsent } from "@/components/privacy-consent";
import { Card, FilledButton, PageHeader, Pill, SectionHeader } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | weave+" },
      {
        name: "description",
        content:
          "Manage your weave+ profile, notifications, theme, shortcuts, privacy choices and workspace configuration.",
      },
      { property: "og:title", content: "Settings | weave+" },
      {
        property: "og:description",
        content: "Profile, notifications, theme, shortcuts and workspace settings.",
      },
    ],
  }),
  component: SettingsPage,
});

type Notifications = {
  deadlines: boolean;
  mentions: boolean;
  grading: boolean;
  digest: boolean;
};

const DEFAULT_NOTIFICATIONS: Notifications = {
  deadlines: true,
  mentions: true,
  grading: true,
  digest: false,
};

const notificationStore = createLocalStore<Notifications>(
  "weave-notifications",
  (raw) => {
    if (!raw) return DEFAULT_NOTIFICATIONS;
    try {
      return { ...DEFAULT_NOTIFICATIONS, ...(JSON.parse(raw) as Partial<Notifications>) };
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },
  (value) => JSON.stringify(value),
);

const NOTIFICATION_LABELS: Record<keyof Notifications, string> = {
  deadlines: "Upcoming assignment deadlines",
  mentions: "Mentions in notes and chats",
  grading: "Submissions waiting on grading",
  digest: "Weekly workspace digest",
};

const SHORTCUTS: Array<[string, string]> = [
  ["Open command bar", "Cmd K"],
  ["New note", "N"],
  ["New chat", "C"],
  ["Toggle sidebar", "Cmd B"],
  ["Graph view", "G then G"],
  ["Search notes", "/"],
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-pill transition-colors",
        checked ? "bg-snow-white" : "bg-accent hairline",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full transition-all",
          checked ? "left-6 bg-graphite-surface" : "left-1 bg-smoke",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const { user } = useSession();
  const { role } = useRole();
  const { data: profile, refetch } = useProfile();
  const { theme, setTheme } = useTheme();
  const notifications = notificationStore.useStore();
  const { consent, setConsent } = useAnalyticsConsent();
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile?.full_name]);

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    toast.success("Profile updated");
    refetch();
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Your profile, notifications, appearance and privacy choices."
      />

      <SectionHeader title="Profile" />
      <Card className="mb-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-muted hairline">
            <HugeiconsIcon
              icon={UserIcon}
              size={18}
              strokeWidth={1.6}
              className="text-snow-white"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body font-medium text-snow-white">
              {profile?.full_name ?? user?.email}
            </p>
            <p className="text-caption text-slate">Free plan</p>
          </div>
        </div>
        <label className="mt-6 block text-body-sm text-smoke">
          Display name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 w-full rounded-ui bg-muted px-4 py-3 text-body text-snow-white outline-none hairline placeholder:text-slate"
          />
        </label>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-body-sm text-slate">
          Signed in as {user?.email} · role <Pill tone="lavender">{role ?? "…"}</Pill>
        </p>
        <FilledButton onClick={save} disabled={busy} compact className="mt-6">
          {busy ? "Saving…" : "Save profile"}
        </FilledButton>
      </Card>

      <SectionHeader title="Notifications" description="Choose what weave+ tells you about." />
      <Card className="mb-10">
        <div className="flex flex-col gap-1">
          {(Object.keys(NOTIFICATION_LABELS) as Array<keyof Notifications>).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-3 text-body-sm text-bone">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  size={16}
                  strokeWidth={1.6}
                  className="shrink-0 text-slate"
                />
                {NOTIFICATION_LABELS[key]}
              </span>
              <Toggle
                label={NOTIFICATION_LABELS[key]}
                checked={notifications[key]}
                onChange={(next) => notificationStore.set({ ...notifications, [key]: next })}
              />
            </div>
          ))}
        </div>
      </Card>

      <SectionHeader title="Theme" description="Applies across the app on this device." />
      <Card className="mb-10">
        <div className="flex flex-wrap gap-2">
          {(["dark", "light"] as Theme[]).map((option) => (
            <button
              key={option}
              onClick={() => setTheme(option)}
              aria-pressed={theme === option}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-pill px-5 py-2.5 text-body-sm font-medium capitalize transition-colors",
                theme === option
                  ? "bg-snow-white text-graphite-surface"
                  : "bg-muted text-bone hairline hover:bg-accent hover:text-snow-white",
              )}
            >
              <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.6} />
              {option}
            </button>
          ))}
        </div>
      </Card>

      <SectionHeader title="Shortcuts" />
      <Card className="mb-10">
        <div className="grid gap-1 sm:grid-cols-2">
          {SHORTCUTS.map(([label, keys]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2 text-body-sm text-bone">
                <HugeiconsIcon
                  icon={KeyboardIcon}
                  size={16}
                  strokeWidth={1.6}
                  className="text-slate"
                />
                {label}
              </span>
              <kbd className="rounded-ui bg-muted px-2.5 py-1 text-caption font-medium text-smoke hairline">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      <SectionHeader
        title="Privacy"
        description="Control the optional analytics described in our privacy notice."
      />
      <Card className="mb-10">
        <div className="flex items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3 text-body-sm text-bone">
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              size={16}
              strokeWidth={1.6}
              className="shrink-0 text-slate"
            />
            Share anonymised questions to improve weave+
          </span>
          <Toggle
            label="Share anonymised analytics"
            checked={consent === "granted"}
            onChange={(next) => {
              setConsent(next ? "granted" : "denied");
              toast.success(next ? "Analytics sharing on" : "Analytics sharing off");
            }}
          />
        </div>
        <Link
          to="/privacy"
          className="mt-5 inline-block text-body-sm font-medium text-bone underline-offset-4 hover:underline"
        >
          Read the privacy notice
        </Link>
      </Card>

      {role === "admin" ? (
        <>
          <SectionHeader
            title="Workspace"
            description="Admin-only configuration for this workspace."
          />
          <Card>
            <p className="text-body text-ash">
              Roles are assigned from the Members page. Courses, modules and assignments are managed
              inside each course's settings tab. Billing stays on the free tier for this workspace,
              no paid services are connected.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/members"
                className="inline-flex min-h-11 items-center rounded-pill bg-muted px-4 py-2 text-body-sm font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
              >
                Manage members
              </Link>
              <Link
                to="/plugins"
                className="inline-flex min-h-11 items-center rounded-pill bg-muted px-4 py-2 text-body-sm font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
              >
                Integrations
              </Link>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
