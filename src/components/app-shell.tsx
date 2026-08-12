import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Note01Icon,
  ShareKnowledgeIcon,
  PenTool01Icon,
  TeachingIcon,
  Calendar03Icon,
  SparklesIcon,
  PlugSocketIcon,
  UserGroupIcon,
  Settings01Icon,
  Logout01Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  Menu01Icon,
  Cancel01Icon,
  MoreHorizontalIcon,
  ArrowDown01Icon,
  KeyboardIcon,
  Notification01Icon,
  UserIcon,
  Mail01Icon,
  Clock01Icon,
  HelpCircleIcon,
  BookOpen01Icon,
  QrCodeIcon,
  Megaphone01Icon,
  AccessibilityIcon,
  Video01Icon,
  ListTreeIcon,
  HierarchyIcon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useRole, useSession, displayName, type AppRole } from "@/lib/session";
import { useViewRole } from "@/lib/view-role";
import { useDemoProfile, demoFullName } from "@/lib/demo-profile";
import { useEnabledPluginList } from "@/lib/plugins-state";
import { useA11y } from "@/lib/a11y";
import { labelForPath, recordVisit } from "@/lib/history-store";
import { Logo } from "@/components/logo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CourseRail } from "@/components/course-rail";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon, staffOnly: false },
  { to: "/notes", label: "Notes", icon: Note01Icon, staffOnly: false },
  {
    to: "/notes/graph",
    label: "Graph view",
    icon: ShareKnowledgeIcon,
    staffOnly: false,
    pro: true,
  },
  { to: "/canvas", label: "Canvas", icon: PenTool01Icon, staffOnly: false, pro: true },
  { to: "/courses", label: "Courses", icon: TeachingIcon, staffOnly: false },
  { to: "/calendar", label: "Calendar", icon: Calendar03Icon, staffOnly: false },
  { to: "/meetings", label: "Meetings", icon: Video01Icon, staffOnly: false },
  { to: "/inbox", label: "Chat", icon: Mail01Icon, staffOnly: false, pro: true },

  { to: "/history", label: "History", icon: Clock01Icon, staffOnly: false, pro: true },
  { to: "/agent", label: "Agent", icon: SparklesIcon, staffOnly: false, pro: true },
  { to: "/plugins", label: "Integrations", icon: PlugSocketIcon, staffOnly: false },
  { to: "/help", label: "Help", icon: HelpCircleIcon, staffOnly: false },
  { to: "/members", label: "Members", icon: UserGroupIcon, staffOnly: true },
  { to: "/directory", label: "Directory", icon: ListTreeIcon, staffOnly: true },
  { to: "/orgchart", label: "Org chart", icon: HierarchyIcon, staffOnly: true },
  { to: "/settings", label: "Settings", icon: Settings01Icon, staffOnly: true },
] as const;

/** Account area, mirroring the global account tray. */
const ACCOUNT_LINKS = [
  { to: "/account/notifications", label: "Notifications", icon: Notification01Icon },
  { to: "/account/profile", label: "Profile", icon: UserIcon },
  { to: "/account/files", label: "Files", icon: Note01Icon },
  { to: "/account/eportfolios", label: "ePortfolios (Legacy)", icon: BookOpen01Icon },
  { to: "/account/shared", label: "Shared Content", icon: ShareKnowledgeIcon },
  { to: "/account/portfolio", label: "Portfolio", icon: TeachingIcon },
  { to: "/account/qr", label: "QR for Mobile Login", icon: QrCodeIcon },
  { to: "/account/announcements", label: "Global Announcements", icon: Megaphone01Icon },
  { to: "/account/accessibility", label: "Accessibility Settings", icon: AccessibilityIcon },
] as const;

const COLLAPSE_KEY = "weave-sidebar-collapsed";
const ROLES: AppRole[] = ["admin", "lecturer", "student"];

/** Roles read as proper nouns in the UI: Student, Lecturer, Admin. */
const roleLabel = (r?: AppRole | string | null) =>
  r ? r.charAt(0).toUpperCase() + r.slice(1) : "";

export function AppShell({ children }: { children: ReactNode }) {
  const { role, actualRole } = useRole();
  const { user } = useSession();
  const { data: profile } = useProfile();
  const { viewRole, setViewRole } = useViewRole();
  const { profile: demo, setProfile: setDemoProfile } = useDemoProfile();
  const enabledPlugins = useEnabledPluginList();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const courseList = useQuery({
    queryKey: ["sidebar-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, code, title").order("code");
      return data ?? [];
    },
  });

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountGroupOpen, setAccountGroupOpen] = useState(false);
  const [coursesGroupOpen, setCoursesGroupOpen] = useState(true);
  const [pluginGroupOpen, setPluginGroupOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  useA11y();

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setAccountOpen(false);
    setRoleOpen(false);
    recordVisit(pathname, labelForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isStudent = role === "student";
  /** Students see the locked tools as PRO instead of dead links. */
  const locked = (item: { readonly pro?: boolean } | Record<string, unknown>) =>
    isStudent && Boolean((item as { pro?: boolean }).pro);
  const personName = demo ? demoFullName(demo) : displayName(user, profile?.full_name);
  const personAvatar = demo?.avatar ?? profile?.avatar_url ?? null;
  const personEmail = demo?.email ?? user?.email ?? "";
  const home = role === "student" ? ("/student" as const) : ("/dashboard" as const);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    setDemoProfile(null);
    await supabase.auth.signOut();
    navigate({ to: "/onboarding", replace: true });
  }

  const items = NAV.filter((item) => !(item.staffOnly && isStudent));

  const isActive = (to: string) =>
    to === "/notes"
      ? pathname === "/notes" || /^\/notes\/(?!graph)/.test(pathname)
      : pathname === to || pathname.startsWith(`${to}/`);

  const activeCourseId = /^\/courses\/([^/]+)/.exec(pathname)?.[1];

  const groupButton = (
    label: string,
    icon: typeof TeachingIcon,
    open: boolean,
    setOpen: (v: boolean) => void,
    active: boolean,
    compact: boolean,
  ) => (
    <button
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={cn(
        "flex w-full items-center gap-3 overflow-hidden rounded-ui py-2 text-body-sm font-medium transition-colors duration-200",
        active ? "bg-accent text-snow-white" : "text-smoke hover:bg-muted hover:text-snow-white",
        compact ? "justify-center gap-0 px-0" : "px-3",
      )}
    >
      <HugeiconsIcon icon={icon} size={18} strokeWidth={1.6} className="shrink-0" />
      {compact ? null : (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={1.8}
            className={cn("shrink-0 transition-transform", open && "rotate-180")}
          />
        </>
      )}
    </button>
  );

  const tooltip = (label: string, compact: boolean) => (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-ui bg-graphite-surface px-2.5 py-1.5 text-caption font-medium text-snow-white opacity-0 transition-all duration-150 hairline group-hover/nav:translate-x-0 group-hover/nav:opacity-100",
        compact ? "block" : "hidden",
      )}
    >
      {label}
    </span>
  );

  const subShell = (children: ReactNode) => (
    <div className="mb-1 ml-[26px] mt-0.5 flex flex-col border-l border-border pl-3">
      {children}
    </div>
  );

  const subClass = (on: boolean) =>
    cn(
      "flex items-center gap-2 truncate rounded-ui px-2 py-1.5 text-caption transition-colors",
      on ? "text-snow-white" : "text-slate hover:text-snow-white",
    );

  const navList = (compact: boolean) => (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item.to);

        /** Courses: dropdown holding the course list, or the active course menu. */
        if (item.to === "/courses") {
          return (
            <div key={item.to} className="group/nav relative">
              {groupButton(
                "Courses",
                item.icon,
                coursesGroupOpen,
                setCoursesGroupOpen,
                active,
                compact,
              )}
              {tooltip("Courses", compact)}
              {coursesGroupOpen && !compact
                ? subShell(
                    <>
                      <Link to="/courses" className={subClass(pathname === "/courses")}>
                        All courses
                      </Link>
                      {(courseList.data ?? []).map((course) => (
                        <Link
                          key={course.id}
                          to="/courses/$courseId"
                          params={{ courseId: course.id }}
                          className={subClass(activeCourseId === course.id)}
                          title={course.title}
                        >
                          <span className="truncate">
                            {course.code} · {course.title}
                          </span>
                        </Link>
                      ))}
                    </>,
                  )
                : null}
            </div>
          );
        }

        /** Integrations: dropdown holding whatever is connected. */
        if (item.to === "/plugins") {
          return (
            <div key={item.to} className="group/nav relative">
              {groupButton(
                "Integrations",
                item.icon,
                pluginGroupOpen,
                setPluginGroupOpen,
                active,
                compact,
              )}
              {tooltip("Integrations", compact)}
              {pluginGroupOpen && !compact
                ? subShell(
                    <>
                      <Link to="/plugins" className={subClass(pathname === "/plugins")}>
                        All integrations
                      </Link>
                      {enabledPlugins.length === 0 ? (
                        <span className="px-2 py-1.5 text-caption text-slate">
                          Nothing connected yet
                        </span>
                      ) : (
                        enabledPlugins.map((plugin) => (
                          <Link
                            key={plugin.id}
                            to="/plugins"
                            hash={plugin.id}
                            className={subClass(false)}
                          >
                            <span className="truncate">{plugin.name}</span>
                          </Link>
                        ))
                      )}
                    </>,
                  )
                : null}
            </div>
          );
        }

        if (locked(item)) {
          return (
            <div key={item.to} className="group/nav relative">
              <div
                aria-disabled="true"
                title={`${item.label} is part of the PRO plan`}
                className={cn(
                  "flex cursor-not-allowed items-center gap-3 overflow-hidden rounded-ui py-2 text-body-sm font-medium text-slate",
                  compact ? "justify-center gap-0 px-0" : "px-3",
                )}
              >
                <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.6} className="shrink-0" />
                {compact ? null : (
                  <>
                    <span className="flex-1 truncate whitespace-nowrap">{item.label}</span>
                    <span className="shrink-0 rounded-pill bg-blurple px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-violet">
                      Pro
                    </span>
                  </>
                )}
              </div>
              {tooltip(`${item.label} · PRO`, compact)}
            </div>
          );
        }

        return (
          <div key={item.to} className="group/nav relative">
            <Link
              to={item.to}
              className={cn(
                "flex items-center gap-3 overflow-hidden rounded-ui py-2 text-body-sm font-medium transition-[background-color,color,padding] duration-200 ease-out",
                compact ? "justify-center gap-0 px-0" : "px-3",
                active
                  ? "bg-accent text-snow-white"
                  : "text-smoke hover:bg-muted hover:text-snow-white",
              )}
            >
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.6} className="shrink-0" />
              <span
                className={cn(
                  "truncate whitespace-nowrap transition-[opacity,max-width] duration-200 ease-out",
                  compact ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>

            {/* Hover label: the only way to read the rail when it is collapsed */}
            {tooltip(item.label, compact)}
          </div>
        );
      })}

      {/* Account group: personal pages that sit outside course work */}
      <div className="group/nav relative mt-1">
        {groupButton(
          "Account",
          UserIcon,
          accountGroupOpen,
          setAccountGroupOpen,
          pathname.startsWith("/account"),
          compact,
        )}
        {tooltip("Account", compact)}
        {accountGroupOpen && !compact
          ? subShell(
              ACCOUNT_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className={subClass(pathname === link.to)}>
                  <HugeiconsIcon icon={link.icon} size={14} strokeWidth={1.6} />
                  <span className="truncate">{link.label}</span>
                </Link>
              )),
            )
          : null}
      </div>
    </nav>
  );

  /** Admin-only role preview, as a dropdown so only the active role shows. */
  const roleSwitcher =
    actualRole === "admin" ? (
      <div className="relative mt-3">
        <button
          onClick={() => setRoleOpen((v) => !v)}
          aria-expanded={roleOpen}
          aria-haspopup="listbox"
          className="flex w-full items-center justify-between gap-2 rounded-ui bg-blurple px-3 py-2 text-caption font-medium text-on-violet transition-colors hover:bg-blurple/85"
        >
          <span className="truncate">View as {roleLabel(viewRole ?? actualRole)}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={1.8}
            className={cn("shrink-0 transition-transform", roleOpen && "rotate-180")}
          />
        </button>
        {roleOpen ? (
          <div
            role="listbox"
            className="absolute bottom-full left-0 z-50 mb-1 w-full overflow-hidden rounded-ui bg-graphite-surface p-1 hairline"
          >
            {ROLES.map((r) => {
              const on = (viewRole ?? actualRole) === r;
              return (
                <button
                  key={r}
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setViewRole(r === actualRole ? null : r);
                    setRoleOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-ui px-2.5 py-2 text-caption font-medium transition-colors",
                    on
                      ? "bg-accent text-snow-white"
                      : "text-smoke hover:bg-muted hover:text-snow-white",
                  )}
                >
                  {roleLabel(r)}
                  {on ? <span className="text-caption text-slate">current</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    ) : null;

  const accountMenu = (
    <div
      className="absolute bottom-full left-0 z-50 mb-2 w-[264px] overflow-hidden rounded-card-sm bg-graphite-surface p-1.5 hairline"
      role="menu"
    >
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <span className="truncate text-caption text-slate">{personEmail}</span>
        <span className="shrink-0 text-caption text-slate">Free plan</span>
      </div>
      <div className="my-1 h-px bg-border" />
      {!isStudent ? (
        <>
          <Link
            to="/settings"
            role="menuitem"
            className="flex items-center gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.6} />
            Workspace settings
          </Link>
          <Link
            to="/members"
            role="menuitem"
            className="flex items-center gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={1.6} />
            Members
          </Link>
          <div className="my-1 h-px bg-border" />
        </>
      ) : null}
      <Link
        to="/settings"
        hash="profile"
        role="menuitem"
        className="flex items-center gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
      >
        <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.6} />
        Profile settings
      </Link>
      <Link
        to="/settings"
        hash="notifications"
        role="menuitem"
        className="flex items-center gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
      >
        <HugeiconsIcon icon={Notification01Icon} size={16} strokeWidth={1.6} />
        Notification settings
      </Link>
      <Link
        to="/settings"
        hash="shortcuts"
        role="menuitem"
        className="flex items-center justify-between gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
      >
        <span className="flex items-center gap-2.5">
          <HugeiconsIcon icon={KeyboardIcon} size={16} strokeWidth={1.6} />
          Keyboard shortcuts
        </span>
        <kbd className="rounded-ui px-1.5 py-0.5 text-caption text-slate hairline">?</kbd>
      </Link>

      <div className="my-1 h-px bg-border" />
      <button
        onClick={handleSignOut}
        role="menuitem"
        className="flex w-full items-center gap-2.5 rounded-ui px-2.5 py-2 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
      >
        <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.6} />
        Sign out
      </button>
    </div>
  );

  const account = (compact: boolean) =>
    compact ? (
      <div className="group/nav relative" ref={accountRef}>
        <button
          onClick={() => setAccountOpen((v) => !v)}
          aria-label="Account and settings"
          aria-expanded={accountOpen}
          className="flex w-full justify-center rounded-ui py-2 text-smoke transition-colors hover:bg-muted hover:text-snow-white"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} strokeWidth={1.6} />
        </button>
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-ui bg-graphite-surface px-2.5 py-1.5 text-caption font-medium text-snow-white opacity-0 transition-all duration-150 hairline group-hover/nav:translate-x-0 group-hover/nav:opacity-100">
          Settings
        </span>
        {accountOpen ? accountMenu : null}
      </div>
    ) : (
      <div className="relative rounded-card-sm bg-blurple/12 p-3.5 hairline" ref={accountRef}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-blurple text-caption font-medium text-on-violet">
            {personAvatar ? (
              <img src={personAvatar} alt={personName} className="h-full w-full object-cover" />
            ) : (
              personName.slice(0, 1).toUpperCase()
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-snow-white">{personName}</p>
            <p className="mt-0.5 truncate text-caption text-blurple">
              {role ? roleLabel(role) : "loading"}
              {viewRole && viewRole !== actualRole ? " preview" : ""}
            </p>
          </div>
          <button
            onClick={() => setAccountOpen((v) => !v)}
            aria-label="Account and settings"
            aria-expanded={accountOpen}
            className="shrink-0 rounded-ui p-1.5 text-slate transition-colors hover:bg-blurple/20 hover:text-snow-white"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.6} />
          </button>
        </div>
        {roleSwitcher}
        {accountOpen ? accountMenu : null}
      </div>
    );

  return (
    <div className="flex min-h-screen w-full bg-void-canvas">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r border-border py-6 md:flex",
          "transition-[width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "w-[72px] px-3" : "w-60 px-4",
        )}
      >
        <div className="min-w-0">
          <div
            className={cn(
              "mb-8 flex items-center gap-2",
              collapsed ? "flex-col" : "justify-between",
            )}
          >
            <Link to={home} className="min-w-0">
              <Logo size={collapsed ? "xs" : "md"} showLabel={!collapsed} />
            </Link>
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-ui p-1.5 text-slate transition-colors hover:bg-muted hover:text-snow-white"
            >
              <HugeiconsIcon
                icon={collapsed ? SidebarRightIcon : SidebarLeftIcon}
                size={17}
                strokeWidth={1.6}
              />
            </button>
          </div>
          {navList(collapsed)}
        </div>

        <div className="flex flex-col gap-2">{account(collapsed)}</div>
      </aside>

      {/* Second sidebar: the open course's own menu */}
      {activeCourseId ? <CourseRail courseId={activeCourseId} /> : null}

      {/* Mobile drawer */}

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-void-canvas/80 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[80vw] max-w-72 animate-slide-in-right flex-col justify-between overflow-y-auto border-r border-border bg-void-canvas px-4 py-6">
            <div>
              <div className="mb-8 flex items-center justify-between">
                <Logo size="md" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-ui p-1.5 text-slate hover:text-snow-white"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} />
                </button>
              </div>
              {navList(false)}
              {activeCourseId ? <CourseRail courseId={activeCourseId} variant="inline" /> : null}
            </div>
            <div className="mt-6 flex flex-col gap-2">{account(false)}</div>
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-void-canvas/85 px-4 py-3 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-ui p-1.5 text-smoke hover:text-snow-white"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.6} />
          </button>
          <Logo size="sm" />
        </div>

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 md:pt-12">
          {pathname === "/dashboard" ? null : <Breadcrumbs />}
          {children}
        </main>
      </div>
    </div>
  );
}
