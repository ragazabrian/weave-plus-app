import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ShareKnowledgeIcon,
  TeachingIcon,
  SparklesIcon,
  PuzzleIcon,
  Note01Icon,
  PenTool01Icon,
  Calendar03Icon,
  Search01Icon,
  Menu01Icon,
  Cancel01Icon,
  PlusSignIcon,
  Tick02Icon,
  ShieldKeyIcon,
  SecurityLockIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { INTEGRATION_LOGOS } from "@/lib/plugins";
import { Logo } from "@/components/logo";
import { useTheme } from "@/lib/theme";
import { PrivacyConsentModal } from "@/components/privacy-consent";
import { LinkedInInviteModal } from "@/components/linkedin-modal";
import {
  VaultMock,
  CourseMock,
  AgentMock,
  GraphMock,
  GradebookMock,
  CalendarMock,
} from "@/components/landing-mocks";
import { PlatformStats } from "@/components/auth0-sections";

/** Cycles a list of words in place, one at a time. */
function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <span className="relative inline-block max-w-full align-baseline">
      {/* sizer keeps the inline flow width equal to the active word */}
      <span className="invisible whitespace-normal">{words[index]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 bg-[linear-gradient(90deg,var(--p-snow-white),color-mix(in_oklab,var(--p-dusk-violet)_70%,var(--p-snow-white)))] bg-clip-text text-transparent transition-all duration-500 ease-out",
            i === index
              ? "translate-y-0 opacity-100 blur-0"
              : "pointer-events-none -translate-y-[0.35em] opacity-0 blur-[2px]",
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "weave+ | the knowledge base your course runs on" },
      {
        name: "description",
        content:
          "weave+ pairs a multiplayer linked-notes vault with a lightweight course platform, plus an agent that reasons across everything your role can see.",
      },
      {
        property: "og:title",
        content: "weave+ | the knowledge base your course runs on",
      },
      {
        property: "og:description",
        content:
          "A collaborative notes vault, whiteboards, modules, assignments and grading, with an agent that reads across all of it.",
      },
    ],
  }),
  component: Landing,
});

const NAV_LINKS = [
  { href: "#challenge", label: "Challenge" },
  { href: "#solutions", label: "Solutions" },
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#faq", label: "FAQ" },
];

/** Apps shown in the integrations ticker. Logos come from the Simple Icons CDN. */
const INTEGRATION_TILES: { name: string; initials: string; slug: string }[] = [
  { name: "Google Drive", initials: "GD", slug: "googledrive" },
  { name: "Gmail", initials: "GM", slug: "gmail" },
  { name: "Google Calendar", initials: "GC", slug: "googlecalendar" },
  { name: "Notion", initials: "No", slug: "notion" },
  { name: "Google Meet", initials: "GM", slug: "googlemeet" },
  { name: "GitHub", initials: "GH", slug: "github" },
  { name: "Zotero", initials: "Zo", slug: "zotero" },
  { name: "GitLab", initials: "GL", slug: "gitlab" },
  { name: "Linear", initials: "Li", slug: "linear" },
  { name: "Figma", initials: "Fi", slug: "figma" },
  { name: "Todoist", initials: "Td", slug: "todoist" },
  { name: "Evernote", initials: "Ev", slug: "evernote" },
  { name: "Dropbox", initials: "Db", slug: "dropbox" },
  { name: "Zoom", initials: "Zm", slug: "zoom" },
  { name: "Canvas LMS", initials: "Cv", slug: "canvas" },
  { name: "Moodle", initials: "Mo", slug: "moodle" },
  { name: "Airtable", initials: "At", slug: "airtable" },
  { name: "Jira", initials: "Ji", slug: "jira" },
  { name: "Confluence", initials: "Cf", slug: "confluence" },
  { name: "YouTube", initials: "Yt", slug: "youtube" },
  { name: "Trello", initials: "Tr", slug: "trello" },
  { name: "Asana", initials: "As", slug: "asana" },
  { name: "Obsidian", initials: "Ob", slug: "obsidian" },
  { name: "Miro", initials: "Mi", slug: "miro" },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Solutions", href: "#solutions" },
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "How it works", href: "#how" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Notes", to: "/notes" },
      { label: "Courses", to: "/courses" },
      { label: "Canvas", to: "/canvas" },
    ],
  },
  {
    title: "Others",
    links: [
      { label: "Privacy Notice", to: "/privacy" },
      { label: "Sign in", to: "/onboarding" },
      { label: "Get started", to: "/onboarding" },
      { label: "FAQ", href: "#faq" },
    ],
  },
] as const;

const CHALLENGE = [
  {
    icon: ShareKnowledgeIcon,
    title: "Knowledge fragmentation",
    body: "Course material lives in slide decks, the reading lives in a drive folder, and the discussion lives somewhere nobody can search. Nothing links to anything.",
  },
  {
    icon: TeachingIcon,
    title: "Teaching tools that fight you",
    body: "Traditional course platforms make you rebuild the same material every term, and none of it survives as knowledge once the term closes.",
  },
  {
    icon: Calendar03Icon,
    title: "Deadline blindness",
    body: "Grading queues, drop-off and looming submissions sit in three different views, so the thing that actually needs you today stays invisible.",
  },
];

const SOLUTIONS = [
  {
    id: "vault",
    tab: "Linked vault",
    title: "A vault, not a folder tree",
    body: "Notes link to notes. Backlinks, tags, an interactive graph and version history come as standard, and every edit shows who else is in the room.",
    bullets: ["Backlinks and tags", "Interactive graph", "Version history"],
    mock: VaultMock,
  },
  {
    id: "courses",
    tab: "Course layer",
    title: "Courses without the platform tax",
    body: "Modules are ordered note sequences. Assignments carry real deadlines, submissions and feedback. Progress rolls up per cohort automatically.",
    bullets: ["Ordered modules", "Submissions and grading", "Cohort progress"],
    mock: CourseMock,
  },
  {
    id: "agent",
    tab: "Agent",
    title: "An agent with your permissions",
    body: "The agent reads exactly what your role can read, then ranks what actually needs you today, citing hours, grades and completion rates.",
    bullets: ["Role scoped reads", "Ranked priorities", "Cited evidence"],
    mock: AgentMock,
  },
];

const FEATURES = [
  {
    icon: ShareKnowledgeIcon,
    title: "See the shape of your knowledge",
    body: "An interactive graph of every note and link, so gaps and orphans show themselves.",
    mock: GraphMock,
  },
  {
    icon: TeachingIcon,
    title: "Grading that stays in one place",
    body: "Submissions, marks and feedback per cohort, rolled up without a spreadsheet.",
    mock: GradebookMock,
  },
  {
    icon: Calendar03Icon,
    title: "Every deadline in one column",
    body: "Course dates, assignment due dates and grading windows merged into one calendar.",
    mock: CalendarMock,
  },
];

const SURFACES = [
  { icon: Note01Icon, label: "Linked notes", meta: "Backlinks, tags, history" },
  { icon: PenTool01Icon, label: "Canvas", meta: "Multiplayer whiteboards" },
  { icon: Calendar03Icon, label: "Calendar", meta: "Merged deadlines" },
  { icon: UserGroupIcon, label: "Members", meta: "Roles and permissions" },
];

const HOW = [
  {
    step: "01",
    title: "Bring in your material",
    body: "Write or paste your existing notes. Link them as you go and weave+ builds the graph behind you.",
  },
  {
    step: "02",
    title: "Wrap it in a course",
    body: "Order notes into modules, attach assignments with real deadlines, invite the cohort and set permissions.",
  },
  {
    step: "03",
    title: "Let the agent watch it",
    body: "The agent tracks grading queues, deadlines and drop-off, and tells you what needs attention today.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Our reading list, seminar notes and grading finally sit in one graph. The term no longer resets to zero.",
    name: "Dr. Amara Okafor",
    role: "Course lead, Media Studies",
  },
  {
    quote:
      "I open the dashboard, read three priorities and know exactly where the cohort is drifting.",
    name: "Ben Halloran",
    role: "Lecturer, Interaction Design",
  },
  {
    quote:
      "As a student I stopped chasing announcements. Everything I need links back to the note it came from.",
    name: "Priya Raman",
    role: "Second year student",
  },
];

const SECURITY = [
  {
    icon: ShieldKeyIcon,
    title: "Row level permissions",
    body: "Every note, course and thread is filtered in the database by your role, not by hiding buttons in the interface.",
  },
  {
    icon: SecurityLockIcon,
    title: "Scoped agent access",
    body: "The agent inherits your permissions exactly. It cannot read a course you are not part of.",
  },
  {
    icon: Tick02Icon,
    title: "Auditable activity",
    body: "Agent runs and role changes are recorded so admins can see what happened and who changed it.",
  },
];

const FAQ = [
  {
    q: "Can the same URL show different things per role?",
    a: "Yes. Admin, lecturer and student share one route tree. The data each role can reach is filtered in the database, so a student simply never sees the members or workspace settings screens.",
  },
  {
    q: "Is editing really multiplayer?",
    a: "Notes and canvases sync live. Canvases persist a shared snapshot, and note edits are versioned so you can walk back any change.",
  },
  {
    q: "Do I have to move off my current course tool at once?",
    a: "No. Most teams start with the vault, link their existing material, then wrap a single course in modules and assignments before moving the rest.",
  },
  {
    q: "What does the agent actually do?",
    a: "It reads the notes, courses, submissions and deadlines your role can see, ranks what needs action today, and cites the evidence behind each item.",
  },
  {
    q: "Can I run it in light mode?",
    a: "Yes. The workspace ships with light and dark themes, switchable from the sidebar, and both share one token set.",
  },
];

/**
 * Hero product shot, coded rather than a screenshot. It mirrors the real
 * dashboard layout and stays interactive: pick a surface in the rail and edit
 * the note line directly.
 */
function DashboardMockup() {
  const [surface, setSurface] = useState("Dashboard");
  const [noteTitle, setNoteTitle] = useState("Week 04 · critique framework");

  const rail = [
    { label: "Dashboard", icon: SparklesIcon },
    { label: "Notes", icon: Note01Icon },
    { label: "Graph view", icon: ShareKnowledgeIcon },
    { label: "Canvas", icon: PenTool01Icon },
    { label: "Courses", icon: TeachingIcon },
    { label: "Calendar", icon: Calendar03Icon },
  ];

  const priorities = [
    {
      severity: "p0",
      title: "12 submissions awaiting grading",
      why: "IMD-201 · oldest waiting 3 days",
    },
    { severity: "p1", title: "Module 5 unpublished", why: "Cohort reaches it on Thursday" },
    { severity: "p2", title: "Reading note has no backlinks", why: "Link it into Module 3" },
  ];

  return (
    <div className="overflow-hidden rounded-card bg-graphite-surface text-left hairline">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="ml-3 truncate text-caption text-slate">
          weave+ / {surface.toLowerCase()}
        </span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption text-slate hairline sm:flex">
          <HugeiconsIcon icon={Search01Icon} size={13} strokeWidth={1.6} />
          Search everything
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[168px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-0.5 border-r border-border p-3 sm:flex">
          <p className="px-2 pb-2 font-display text-body-sm font-medium text-snow-white">weave+</p>
          {rail.map((item) => (
            <button
              key={item.label}
              onClick={() => setSurface(item.label)}
              className={cn(
                "flex items-center gap-2 rounded-ui px-2 py-1.5 text-left text-caption font-medium transition-colors",
                surface === item.label
                  ? "bg-accent text-snow-white"
                  : "text-smoke hover:text-snow-white",
              )}
            >
              <HugeiconsIcon icon={item.icon} size={14} strokeWidth={1.6} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-caption uppercase tracking-widest text-slate">
                lecturer workspace
              </p>
              <p className="mt-1 truncate font-display text-body-lg font-medium text-snow-white">
                {surface}
              </p>
            </div>
            <span className="rounded-pill bg-snow-white px-3 py-1 text-caption font-medium text-graphite-surface">
              Agent ready
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { k: "Awaiting grading", v: "12" },
              { k: "Deadlines this week", v: "5" },
              { k: "Notes in reach", v: "248" },
            ].map((stat) => (
              <div key={stat.k} className="rounded-card-sm p-3 hairline">
                <p className="text-caption uppercase tracking-wide text-slate">{stat.k}</p>
                <p className="mt-1.5 font-display text-body-lg font-medium text-snow-white">
                  {stat.v}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="relative overflow-hidden rounded-card-sm p-4 hairline">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 left-1/4 h-32 w-32 animate-glow-pulse glow-violet opacity-50"
              />
              <p className="relative text-caption uppercase tracking-wide text-slate">
                Agent priorities
              </p>
              <div className="relative mt-3 flex flex-col gap-2">
                {priorities.map((item) => (
                  <div key={item.title} className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        item.severity === "p0"
                          ? "bg-snow-white"
                          : item.severity === "p1"
                            ? "bg-smoke"
                            : "bg-slate",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-caption font-medium text-snow-white">
                        {item.title}
                      </p>
                      <p className="truncate text-caption text-slate">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-card-sm p-4 hairline">
              <p className="text-caption uppercase tracking-wide text-slate">Continue editing</p>
              <input
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
                aria-label="Note title"
                className="mt-3 w-full rounded-ui bg-muted px-2.5 py-1.5 text-caption font-medium text-snow-white outline-none focus:ring-1 focus:ring-dusk-violet"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {["#critique", "#imd201", "#rubric"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-pill px-2 py-0.5 text-caption text-slate hairline"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-caption text-slate">Backlinks: 4 · edited 2h ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reveals its children once they scroll into view. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, shown };
}

/** One sticky solution panel. Panels stack as the page scrolls past them. */
function SolutionPanel({ item, index }: { item: (typeof SOLUTIONS)[number]; index: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <div
      id={`solution-0${index + 1}`}
      className="sticky scroll-mt-28"
      style={{ top: `${96 + index * 18}px` }}
    >
      <div
        ref={ref}
        className={cn(
          "grid gap-6 rounded-card bg-graphite-surface p-6 frost transition-all duration-700 ease-out sm:p-10 lg:min-h-[560px] lg:grid-cols-2 lg:items-center lg:gap-12",
          shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-12 scale-[0.97] opacity-0",
        )}
      >
        <div className="min-w-0">
          <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
            {`0${index + 1}`} · {item.tab}
          </p>
          <h3 className="mt-4 font-display text-heading-sm font-medium tracking-[-0.02em] text-snow-white sm:text-heading">
            {item.title}
          </h3>
          <p className="mt-4 text-body text-ash">{item.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.bullets.map((bullet) => (
              <span
                key={bullet}
                className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-caption font-medium text-bone hairline"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={13}
                  strokeWidth={2}
                  className="shrink-0 text-dusk-violet"
                />
                {bullet}
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-card-sm p-3 hairline sm:p-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 animate-glow-pulse glow-azure opacity-40"
          />
          <div
            className={cn(
              "relative transition-all duration-700 ease-out",
              shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <item.mock />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Brand logo tile. Falls back to initials when a logo cannot load. */
function IntegrationTile({ tile }: { tile: (typeof INTEGRATION_TILES)[number] }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      title={tile.name}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card-sm bg-graphite-surface transition-transform duration-300 hairline hover:-translate-y-1 sm:h-16 sm:w-16"
    >
      {failed ? (
        <span className="text-body-sm font-medium text-bone">{tile.initials}</span>
      ) : (
        <img
          src={`https://cdn.simpleicons.org/${tile.slug}/ffffff`}
          alt={`${tile.name} logo`}
          loading="lazy"
          width={26}
          height={26}
          className="h-6 w-6 object-contain opacity-80 transition-opacity duration-300 hover:opacity-100 sm:h-7 sm:w-7"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/** Infinite logo ticker. The list is duplicated so the loop is seamless. */
function IntegrationTicker({
  tiles,
  reverse,
}: {
  tiles: typeof INTEGRATION_TILES;
  reverse?: boolean;
}) {
  return (
    <div className="flex w-max">
      <div
        className={cn(
          "flex w-max items-center gap-3 pr-3 sm:gap-4 sm:pr-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
      >
        {[...tiles, ...tiles].map((tile, index) => (
          <IntegrationTile key={`${tile.slug}-${index}`} tile={tile} />
        ))}
      </div>
    </div>
  );
}

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroHover, setHeroHover] = useState(false);
  const { setTheme } = useTheme();

  // The landing page is dark only.
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  const heroRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Local cursor inside the hero: plain + icon, no gradient fill.
  useEffect(() => {
    const hero = heroRef.current;
    const cursor = cursorRef.current;
    if (!hero || !cursor) return;

    let nextX = 0;
    let nextY = 0;
    const moveCursor = () => {
      rafRef.current = 0;
      cursor.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
    };

    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      nextX = event.clientX - rect.left;
      nextY = event.clientY - rect.top;
      if (!rafRef.current) {
        rafRef.current = window.requestAnimationFrame(moveCursor);
      }
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      hero.removeEventListener("pointermove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-void-canvas">
      <PrivacyConsentModal />
      <LinkedInInviteModal />
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6 sm:pt-4">
        <div
          className={cn(
            "relative mx-auto w-full max-w-[1200px] rounded-pill transition-all duration-300",
            scrolled ? "bg-void-canvas/70 backdrop-blur-xl hairline" : "bg-transparent",
          )}
        >
          <div className="relative flex items-center justify-between gap-4 px-3 py-2 sm:px-4">
            <Link to="/" className="shrink-0 pl-1">
              <Logo size="md" />
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-body-sm text-smoke lg:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-snow-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/onboarding"
                className="hidden min-h-10 items-center rounded-pill px-3 py-2 text-body-sm font-medium text-bone transition-colors hover:bg-muted hover:text-snow-white sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/onboarding"
                className="inline-flex min-h-11 items-center rounded-pill bg-snow-white px-5 py-2 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
              >
                Get started
              </Link>

              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                className="rounded-pill p-2 text-smoke transition-colors hover:text-snow-white lg:hidden"
              >
                <HugeiconsIcon
                  icon={menuOpen ? Cancel01Icon : Menu01Icon}
                  size={20}
                  strokeWidth={1.6}
                />
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div className="mt-2 rounded-card bg-void-canvas/95 p-2 backdrop-blur-xl hairline lg:hidden">
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-ui px-3 py-2.5 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/onboarding"
                  className="rounded-ui px-3 py-2.5 text-body-sm text-smoke transition-colors hover:bg-muted hover:text-snow-white"
                >
                  Sign in
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          ref={heroRef}
          onPointerEnter={() => setHeroHover(true)}
          onPointerLeave={() => setHeroHover(false)}
          className="relative overflow-hidden cursor-none"
        >
          {/* Animated background glow: the gradient lives here, not on the cursor. */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[820px] -translate-x-1/2 animate-glow-pulse glow-violet"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-[8%] h-[380px] w-[380px] animate-glow-drift glow-amber opacity-60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 right-[6%] h-[420px] w-[420px] animate-glow-drift glow-azure opacity-60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklab,var(--p-dusk-violet)_18%,transparent),transparent)]"
            />
          </div>

          {/* Custom cursor: a plain + icon with a subtle line ring. */}
          <div
            ref={cursorRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-200",
              heroHover && "opacity-100",
            )}
            style={{ width: 44, height: 44, marginLeft: -22, marginTop: -22 }}
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-snow-white/30 bg-void-canvas/40 backdrop-blur-sm">
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={14}
                strokeWidth={1.5}
                className="text-snow-white"
              />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[1200px] px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-24 md:pt-36">
            <span className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-caption text-ash hairline">
              <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-dusk-violet" />
              Workspace, courses and an agent in one place
            </span>
            <h1 className="mx-auto mt-7 max-w-4xl text-balance font-display text-[34px] font-medium leading-[1.18] tracking-[-0.03em] text-snow-white sm:text-display-sm md:text-display">
              The{" "}
              <RotatingWord
                words={["Knowledge base", "Learning vault", "Teaching vault", "Course library"]}
              />{" "}
              your course actually runs on
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-body text-ash sm:mt-6 sm:text-body-lg">
              Write together in a linked vault, teach from it directly, and let an agent watch the
              deadlines, grading queues and drop-off you would otherwise miss.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link
                to="/onboarding"
                className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-snow-white px-6 py-3 text-body font-medium text-graphite-surface transition-colors hover:bg-bone sm:w-auto"
              >
                Get started
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.6} />
              </Link>
              <a
                href="#how"
                className="inline-flex w-full items-center justify-center rounded-pill px-6 py-3 text-body font-medium text-bone transition-colors hairline hover:bg-muted hover:text-snow-white sm:w-auto"
              >
                How it works
              </a>
            </div>
            <p className="mt-6 text-caption text-slate">
              The first account becomes the workspace admin.
            </p>

            {/* Product frame: a coded replica of the real dashboard */}
            <div className="mx-auto mt-14 max-w-5xl rounded-card p-2 frost sm:mt-20">
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* Challenge */}
        <section
          id="challenge"
          className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6 sm:py-24"
        >
          <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
            The challenge
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
            Course knowledge is powerful but disconnected
          </h2>
          <p className="mt-5 max-w-2xl text-body text-ash">
            Teaching teams already have the material. What they lack is a single place where it
            links together, stays searchable and survives the term.
          </p>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {CHALLENGE.map((item) => (
              <article
                key={item.title}
                className="relative overflow-hidden rounded-card p-6 frost sm:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 animate-glow-pulse glow-violet opacity-40"
                />
                <HugeiconsIcon
                  icon={item.icon}
                  size={22}
                  strokeWidth={1.5}
                  className="relative text-snow-white"
                />
                <h3 className="relative mt-6 text-subheading font-medium text-snow-white">
                  {item.title}
                </h3>
                <p className="relative mt-3 text-body-sm text-ash">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Solutions */}
        <section
          id="solutions"
          className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24"
        >
          <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
            Solutions
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
            Everything your course runs on
          </h2>

          {/* Sticky stack: each panel pins, the next scrolls up over it */}
          <div className="mt-10 flex flex-col gap-6 pb-[30vh]">
            {SOLUTIONS.map((item, index) => (
              <SolutionPanel key={item.id} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Auth0-style platform stats */}
        <PlatformStats />

        {/* Features bento */}
        <section
          id="features"
          className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
                Features
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
                Built for real work
              </h2>
            </div>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
            >
              Get started
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-card p-6 frost sm:p-7 lg:col-span-2">
              <p className="text-caption uppercase tracking-[0.18em] text-slate">Search</p>
              <h3 className="mt-3 font-display text-heading-sm font-medium text-snow-white">
                Find anything across the vault, instantly
              </h3>
              <div className="mt-6 rounded-card-sm p-4 hairline">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={15}
                    strokeWidth={1.6}
                    className="shrink-0 text-slate"
                  />
                  <span className="truncate text-caption text-ash">
                    Searched for "assessment rubric and grading criteria"
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {[
                    { path: "modules/assessment-rubric.md", source: "Notes" },
                    { path: "IMD-201 · Assignment 3 brief", source: "Courses" },
                    { path: "canvas/critique-board", source: "Canvas" },
                    { path: "announcements/grading-window.md", source: "Notes" },
                  ].map((hit) => (
                    <div
                      key={hit.path}
                      className="flex items-center justify-between gap-3 rounded-card-sm px-3 py-2 hairline"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <HugeiconsIcon
                          icon={Note01Icon}
                          size={14}
                          strokeWidth={1.6}
                          className="shrink-0 text-slate"
                        />
                        <span className="truncate text-caption text-bone">{hit.path}</span>
                      </span>
                      <span className="shrink-0 text-caption text-slate">{hit.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-card p-6 frost sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 left-1/2 h-48 w-48 -translate-x-1/2 animate-glow-pulse glow-violet opacity-50"
              />
              <p className="relative text-caption uppercase tracking-[0.18em] text-slate">Agents</p>
              <h3 className="relative mt-3 font-display text-heading-sm font-medium text-snow-white">
                Run complex, multi step course work
              </h3>
              <div className="relative mt-6 flex flex-col gap-2">
                {[
                  "Reads every note your role can see",
                  "Ranks deadlines, grading queues, drop-off",
                  "Drafts the feedback, cites the evidence",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-card-sm px-3 py-2 hairline"
                  >
                    <span className="shrink-0 text-caption text-slate">0{index + 1}</span>
                    <span className="text-caption text-bone">{step}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-card p-6 frost sm:p-7">
              <p className="text-caption uppercase tracking-[0.18em] text-slate">Everywhere</p>
              <h3 className="mt-3 font-display text-heading-sm font-medium text-snow-white">
                Always a keystroke away
              </h3>
              <p className="mt-3 text-body-sm text-ash">
                Notes, canvases, deadlines and threads share one workspace on desktop, tablet and
                phone, in light or dark.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Command palette", "Inbox", "Mobile web", "Light and dark"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-pill px-3 py-1 text-caption text-smoke hairline"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </article>

            <article className="relative overflow-hidden rounded-card p-6 frost sm:p-7 lg:col-span-2">
              <p className="text-caption uppercase tracking-[0.18em] text-slate">Integrations</p>
              <h3 className="mt-3 font-display text-heading-sm font-medium text-snow-white">
                Plugs into your entire stack
              </h3>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {INTEGRATION_LOGOS.map((name) => (
                  <div
                    key={name}
                    className="flex min-w-0 items-center gap-2 rounded-card-sm px-3 py-2.5 hairline"
                  >
                    <HugeiconsIcon
                      icon={PuzzleIcon}
                      size={14}
                      strokeWidth={1.6}
                      className="shrink-0 text-slate"
                    />
                    <span className="truncate text-caption text-bone">{name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-caption text-slate">
                24 free plugins across files, visualization, commands and syncs.
              </p>
            </article>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-card p-6 frost sm:p-7">
                <HugeiconsIcon
                  icon={feature.icon}
                  size={22}
                  strokeWidth={1.5}
                  className="text-snow-white"
                />
                <h3 className="mt-5 text-subheading font-medium text-snow-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-body-sm text-ash">{feature.body}</p>
                <div className="mt-6">
                  <feature.mock />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24">
          <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
            How it works
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
            Live in an afternoon
          </h2>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {HOW.map((item) => (
              <article
                key={item.step}
                className="relative overflow-hidden rounded-card p-6 frost sm:p-7"
              >
                <span className="font-display text-heading-sm font-medium text-slate">
                  {item.step}
                </span>
                <h3 className="mt-4 text-subheading font-medium text-snow-white">{item.title}</h3>
                <p className="mt-3 text-body-sm text-ash">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-3 rounded-card p-6 frost sm:p-8">
            <h3 className="text-subheading font-medium text-snow-white">
              One workspace, nine surfaces
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SURFACES.map((item) => (
                <div key={item.label} className="rounded-card-sm p-5 hairline">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    strokeWidth={1.5}
                    className="text-smoke"
                  />
                  <p className="mt-4 text-body font-medium text-snow-white">{item.label}</p>
                  <p className="mt-1 text-caption text-slate">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="rounded-card p-6 frost sm:p-10">
            <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
              Security
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white">
              Permissions enforced in the database
            </h2>
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {SECURITY.map((item) => (
                <div key={item.title} className="rounded-card-sm p-5 hairline">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    strokeWidth={1.5}
                    className="text-snow-white"
                  />
                  <p className="mt-4 text-body font-medium text-snow-white">{item.title}</p>
                  <p className="mt-2 text-caption text-ash">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:gap-12">
            <div>
              <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">FAQ</p>
              <h2 className="mt-4 font-display text-heading font-medium tracking-[-0.02em] text-snow-white">
                Got questions? We have answers
              </h2>
              <p className="mt-4 text-body-sm text-ash">
                Still unsure how it maps onto your cohort? Start a workspace and the first account
                becomes the admin.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {FAQ.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div key={item.q} className="rounded-card p-5 frost sm:p-6">
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-body font-medium text-snow-white">{item.q}</span>
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        size={16}
                        strokeWidth={1.8}
                        className={cn(
                          "shrink-0 text-slate transition-transform duration-300",
                          open && "rotate-45 text-snow-white",
                        )}
                      />
                    </button>
                    <div
                      className="accordion-grid"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="pt-3 text-body-sm text-ash">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations: glowing orb with app tiles orbiting it */}
        <section
          id="integrations"
          className="relative overflow-hidden px-4 pb-24 pt-4 sm:px-6 sm:pb-32"
        >
          <div className="relative mx-auto w-full max-w-[1200px]">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-[42%] animate-glow-pulse glow-azure"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-[38%] animate-glow-drift glow-violet opacity-70"
            />

            <div className="relative flex flex-col items-center text-center">
              <span className="rounded-pill px-4 py-1.5 text-caption font-medium uppercase tracking-[0.18em] text-bone hairline">
                Coming soon
              </span>
              <h2 className="mt-6 max-w-3xl font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
                Seamlessly integrate every app
              </h2>
              <p className="mt-4 max-w-xl text-body text-ash">
                Connect the tools your course already runs on. weave+ keeps files, threads and
                calendars in sync so the agent can cite them.
              </p>

              <div
                className="relative mt-12 w-full overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                }}
              >
                <IntegrationTicker tiles={INTEGRATION_TILES.slice(0, 12)} />
                <div className="mt-3 sm:mt-4">
                  <IntegrationTicker tiles={INTEGRATION_TILES.slice(12)} reverse />
                </div>
              </div>

              <Link
                to="/plugins"
                className="mt-12 inline-flex min-h-11 items-center gap-2 rounded-pill bg-graphite-surface px-6 py-3 text-body-sm font-medium text-snow-white transition-colors hairline hover:bg-muted"
              >
                Explore all
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="relative overflow-hidden rounded-card bg-graphite-surface p-8 text-center hairline sm:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 animate-glow-pulse glow-violet"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-[12%] h-64 w-64 animate-glow-drift glow-amber opacity-60"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 right-[12%] h-64 w-64 animate-glow-drift glow-azure opacity-60"
            />
            <h2 className="relative font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
              Ready to weave your course together?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-body text-ash sm:text-body-lg">
              Modules, deadlines, grading and the agent all grow out of the vault you already write
              in.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/onboarding"
                className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-snow-white px-6 py-3 text-body font-medium text-graphite-surface transition-colors hover:bg-bone sm:w-auto"
              >
                Get started
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.6} />
              </Link>
              <a
                href="#solutions"
                className="inline-flex w-full items-center justify-center rounded-pill px-6 py-3 text-body font-medium text-bone transition-colors hairline hover:bg-muted hover:text-snow-white sm:w-auto"
              >
                See the solutions
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-card bg-graphite-surface hairline">
          <div className="grid grid-cols-1 gap-10 p-8 sm:p-10 lg:grid-cols-[1.4fr_2fr]">
            <div className="min-w-0">
              <Logo size="lg" />
              <p className="mt-4 max-w-xs text-body-sm text-ash">
                Linked notes, courses and an agent that reads across all of it, in one workspace.
              </p>
              <Link
                to="/onboarding"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
              >
                Get started
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
              </Link>
              <p className="mt-4">
                <a
                  href="https://www.linkedin.com/in/ragazabrian/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-body-sm text-smoke underline underline-offset-4 transition-colors hover:text-snow-white"
                >
                  Follow me on LinkedIn
                </a>
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="min-w-0">
                  <p className="text-caption font-medium uppercase tracking-[0.16em] text-slate">
                    {column.title}
                  </p>
                  <ul className="mt-4 flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        {"to" in link ? (
                          <Link
                            to={link.to}
                            className="text-body-sm text-smoke transition-colors hover:text-snow-white"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-body-sm text-smoke transition-colors hover:text-snow-white"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-8 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="text-caption text-slate">
              © {new Date().getFullYear()} weave+. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/privacy"
                className="text-caption text-slate transition-colors hover:text-snow-white"
              >
                Privacy
              </Link>
              <span className="text-caption text-slate">·</span>
              <a
                href="#faq"
                className="text-caption text-slate transition-colors hover:text-snow-white"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
