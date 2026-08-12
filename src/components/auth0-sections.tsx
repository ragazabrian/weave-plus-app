import { useState } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Tick02Icon,
  Note01Icon,
  TeachingIcon,
  UserGroupIcon,
  Calendar03Icon,
  Search01Icon,
  PlusSignIcon,
  BookOpen01Icon,
  Video01Icon,
  CodeIcon,
  More01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { VaultMock, CourseMock, AgentMock, GradebookMock } from "@/components/landing-mocks";

/** Centered stats block with the three weave+ impact numbers. */
export function PlatformStats() {
  const stats = [
    {
      label: "Less time spent hunting for material",
      value: "78%",
      kicker: "Search built in",
    },
    {
      label: "Faster grading turnaround per cohort",
      value: "3x",
      kicker: "Streamlined queues",
    },
    {
      label: "Free integrations available on day one",
      value: "24",
      kicker: "Plug and play",
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="relative mx-auto w-full max-w-[1200px] text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 animate-glow-pulse glow-violet opacity-30"
        />

        <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-card bg-graphite-surface hairline">
          <span className="font-display text-body-lg font-medium text-snow-white">w+</span>
        </span>

        <h2 className="relative mx-auto mt-8 max-w-4xl text-balance font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
          weave+ is an easy to adopt, adaptable teaching and learning workspace
        </h2>

        <div className="relative mt-16 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.value} className="rounded-card p-6 frost sm:p-8">
              <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
                {stat.kicker}
              </p>
              <p className="mt-4 font-display text-heading font-medium tracking-[-0.03em] text-snow-white sm:text-heading-lg">
                {stat.value}
              </p>
              <p className="mt-2 text-body text-ash">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A compact code window for the "integrate in minutes" split. */
function CodeWindow() {
  const [tab, setTab] = useState("Link");
  const tabs = ["Link", "Tag", "Embed"];

  const snippets: Record<string, string> = {
    Link: "[[Week 04 · critique framework]]\n\n#critique #imd201 #rubric",
    Tag: "#critique\n#imd201\n#rubric",
    Embed: "{{calendar: IMD-201}}\n{{gradebook: cohort-3}}",
  };

  return (
    <div className="overflow-hidden rounded-card bg-graphite-surface hairline">
      <div className="flex items-center gap-1 border-b border-border px-4 py-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-pill px-3 py-1 text-caption font-medium transition-colors",
              tab === t
                ? "bg-snow-white text-graphite-surface"
                : "text-smoke hover:text-snow-white",
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-caption text-slate">weave+ syntax</span>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-6">
        <pre className="text-body-sm leading-relaxed text-bone">
          <code>{snippets[tab]}</code>
        </pre>
      </div>
    </div>
  );
}

/** Split section: code window on the left, heading and platform icons on the right. */
export function PlatformIntegrate() {
  const tiles = [
    { name: "Notes", icon: Note01Icon },
    { name: "Courses", icon: TeachingIcon },
    { name: "Calendar", icon: Calendar03Icon },
    { name: "Members", icon: UserGroupIcon },
    { name: "Search", icon: Search01Icon },
    { name: "Agent", icon: PlusSignIcon },
  ];

  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="mx-auto grid grid-cols-1 w-full max-w-[1200px] items-center gap-12 lg:grid-cols-2">
        <CodeWindow />

        <div className="text-center lg:text-left">
          <h3 className="font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
            Get your course workspace running in minutes
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-body text-ash lg:mx-0">
            With a few links and tags you can have a living knowledge base that feeds your modules,
            deadlines and grading. No migration, no rebuild.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {tiles.map((tile) => (
              <div
                key={tile.name}
                className="flex items-center gap-2 rounded-pill bg-graphite-surface px-3 py-1.5 hairline"
              >
                <HugeiconsIcon
                  icon={tile.icon}
                  size={14}
                  strokeWidth={1.6}
                  className="text-slate"
                />
                <span className="text-caption font-medium text-bone">{tile.name}</span>
              </div>
            ))}
          </div>

          <Link
            to="/onboarding"
            className="mx-auto mt-8 inline-flex min-h-11 items-center gap-2 rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone lg:mx-0"
          >
            Start your workspace
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
}

const BUILT_FOR_TABS = [
  {
    id: "lecturers",
    label: "For lecturers",
    title: "Teach from the vault",
    sections: [
      {
        kicker: "Build courses faster",
        body: "Turn notes into ordered modules, attach assignments and publish to a cohort in a few clicks.",
      },
      {
        kicker: "Grade in one place",
        body: "Submissions, marks and feedback live next to the source material. No spreadsheet gymnastics.",
      },
      {
        kicker: "See who needs help",
        body: "The agent surfaces drop-off, late work and quiet students before they fall behind.",
      },
    ],
    capabilities: ["Module builder", "Rubric builder", "Cohort analytics", "Agent priorities"],
    mock: CourseMock,
  },
  {
    id: "students",
    label: "For students",
    title: "Stop chasing announcements",
    sections: [
      {
        kicker: "One source of truth",
        body: "Every slide, reading and thread links back to the note it came from.",
      },
      {
        kicker: "Deadlines that find you",
        body: "Calendar, inbox and course home share the same due dates, so nothing gets lost.",
      },
      {
        kicker: "Study in context",
        body: "Backlinks and tags connect concepts across courses, automatically.",
      },
    ],
    capabilities: ["Linked notes", "Course feed", "Calendar", "Inbox"],
    mock: VaultMock,
  },
  {
    id: "admins",
    label: "For admins",
    title: "Run the school, not the server",
    sections: [
      {
        kicker: "Role-based access",
        body: "Permissions are enforced in the database. Students cannot see what lecturers can.",
      },
      {
        kicker: "Member management",
        body: "Invite by role, audit activity and manage workspace settings from one screen.",
      },
      {
        kicker: "Institutional scale",
        body: "Add departments, courses and cohorts without multiplying the tool stack.",
      },
    ],
    capabilities: ["User roles", "Audit logs", "Workspace settings", "SSO ready"],
    mock: AgentMock,
  },
  {
    id: "institutions",
    label: "For institutions",
    title: "A platform that grows with you",
    sections: [
      {
        kicker: "Integrate the stack",
        body: "Connect LMS, drives, calendars and communication tools so data flows one way.",
      },
      {
        kicker: "Enterprise security",
        body: "Row-level permissions, scoped agent access and auditable activity out of the box.",
      },
      {
        kicker: "Fast deployment",
        body: "Set up a department in an afternoon and scale to the whole campus.",
      },
    ],
    capabilities: ["LMS connectors", "SSO", "Data residency", "Analytics"],
    mock: GradebookMock,
  },
];

/** Auth0-style "Built for what you're building" with vertical tabs and large cards. */
export function BuiltForSection() {
  const [active, setActive] = useState("lecturers");
  const panel = BUILT_FOR_TABS.find((t) => t.id === active)!;
  const Mock = panel.mock;

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
          Built for what you&apos;re building
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Vertical tabs */}
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-0">
            {BUILT_FOR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "group border-b border-border py-4 text-left transition-colors lg:border-b lg:pr-4",
                  active === tab.id ? "text-snow-white" : "text-smoke hover:text-snow-white",
                )}
              >
                <span className="text-caption font-medium uppercase tracking-[0.18em]">
                  Built for
                </span>{" "}
                <span
                  className={cn(
                    "text-caption font-medium uppercase tracking-[0.18em] transition-colors",
                    active === tab.id ? "text-dusk-violet" : "text-slate",
                  )}
                >
                  {tab.id}
                </span>
              </button>
            ))}
          </div>

          {/* Large card */}
          <div className="relative overflow-hidden rounded-card bg-graphite-surface p-6 hairline sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 animate-glow-pulse glow-violet opacity-30"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 right-1/4 h-56 w-56 animate-glow-drift glow-azure opacity-30"
            />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-heading-sm font-medium tracking-[-0.02em] text-snow-white sm:text-heading">
                  {panel.title}
                </h3>

                <div className="mt-8 flex flex-col gap-6">
                  {panel.sections.map((section) => (
                    <div key={section.kicker}>
                      <p className="text-caption font-medium uppercase tracking-[0.18em] text-dusk-violet">
                        {section.kicker}
                      </p>
                      <p className="mt-1 text-body-sm text-ash">{section.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">
                    Featured capabilities
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {panel.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-2 text-caption text-bone"
                      >
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={13}
                          strokeWidth={2}
                          className="text-dusk-violet"
                        />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/onboarding"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-pill bg-dusk-violet px-5 py-2.5 text-body-sm font-medium text-on-violet transition-colors hover:bg-hover-blurple"
                >
                  Learn more
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.6} />
                </Link>
              </div>

              <div className="relative min-w-0 overflow-hidden rounded-card p-3 frost sm:p-4">
                <Mock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIAL_CARDS = [
  {
    brand: "Dept of Media Studies",
    quote:
      "Our reading list, seminar notes and grading finally sit in one graph. The term no longer resets to zero.",
    name: "Dr. Amara Okafor",
    role: "Course lead",
    featured: true,
    color: "from-dusk-violet to-blue-600",
  },
  {
    brand: "Interaction Design",
    quote:
      "I open the dashboard, read three priorities and know exactly where the cohort is drifting.",
    name: "Ben Halloran",
    role: "Lecturer",
  },
  {
    brand: "Computer Science",
    quote:
      "As a student I stopped chasing announcements. Everything I need links back to the note it came from.",
    name: "Priya Raman",
    role: "Second year student",
  },
  {
    brand: "University IT",
    quote:
      "Row-level access means we can let students and staff share one URL without leaking admin data.",
    name: "Marcus Chen",
    role: "Head of IT",
  },
  {
    brand: "Engineering Faculty",
    quote:
      "We replaced three separate tools with one workspace and the faculty adoption was immediate.",
    name: "Prof. Lin Zhou",
    role: "Dean",
    featured: true,
    color: "from-blue-600 to-cyan-500",
  },
  {
    brand: "Learning Support",
    quote:
      "The agent flags students who go quiet before they miss a deadline. That alone saved us hours.",
    name: "Aisha Patel",
    role: "Student success advisor",
  },
];

/** "You're in great company" bento testimonial grid. */
export function SocialProofSection() {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="text-center font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
          You&apos;re in great company
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIAL_CARDS.map((card, index) => {
            const isFeatured = card.featured;
            return (
              <div
                key={index}
                className={cn(
                  "relative overflow-hidden rounded-card p-6 sm:p-7",
                  isFeatured ? `bg-gradient-to-br ${card.color} text-white` : "frost hairline",
                )}
              >
                <div className="relative">
                  <p
                    className={cn(
                      "text-caption font-medium uppercase tracking-[0.16em]",
                      isFeatured ? "text-white/80" : "text-slate",
                    )}
                  >
                    {card.brand}
                  </p>
                  <h3
                    className={cn(
                      "mt-3 font-display text-heading-sm font-medium tracking-[-0.02em]",
                      isFeatured ? "text-white" : "text-snow-white",
                    )}
                  >
                    {card.quote.split(" ").slice(0, 8).join(" ")}
                    {card.quote.split(" ").length > 8 ? "..." : ""}
                  </h3>
                  {!isFeatured && <p className="mt-4 text-body-sm text-ash">{card.quote}</p>}
                  <div className="mt-6">
                    <p
                      className={cn(
                        "text-body-sm font-medium",
                        isFeatured ? "text-white" : "text-snow-white",
                      )}
                    >
                      {card.name}
                    </p>
                    <p className={cn("text-caption", isFeatured ? "text-white/80" : "text-slate")}>
                      {card.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const CONTENT_TABS = ["AI", "Education", "Product", "Engineering"];

const CONTENT_CARDS = [
  {
    type: "Whitepaper",
    icon: BookOpen01Icon,
    title: "The linked-notes advantage for course design",
    tag: "Education",
    thumbnail: "linear-gradient(135deg,#6b62f2,#3b82f6)",
  },
  {
    type: "Demo",
    icon: Video01Icon,
    title: "How the agent ranks grading queues in real time",
    tag: "AI",
    thumbnail: "linear-gradient(135deg,#0ea5e9,#6366f1)",
  },
  {
    type: "Tutorial",
    icon: CodeIcon,
    title: "Build your first course module in under 10 minutes",
    tag: "Product",
    thumbnail: "linear-gradient(135deg,#8b5cf6,#ec4899)",
  },
  {
    type: "Webinar",
    icon: PlayIcon,
    title: "Scaling course knowledge across a department",
    tag: "Education",
    thumbnail: "linear-gradient(135deg,#14b8a6,#3b82f6)",
  },
];

/** "Read. Watch. Code. More." content carousel. */
export function ContentHubSection() {
  const [filter, setFilter] = useState("AI");
  const filtered = CONTENT_CARDS.filter((c) => filter === "All" || c.tag === filter);

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto w-full max-w-[1200px]">
        <h2 className="text-center font-display text-heading font-medium tracking-[-0.02em] text-snow-white sm:text-heading-lg">
          Read. Watch. Code. More.
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "rounded-pill px-4 py-2 text-caption font-medium transition-colors",
                filter === tab
                  ? "bg-snow-white text-graphite-surface"
                  : "text-bone hairline hover:bg-muted",
              )}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => setFilter("All")}
            className={cn(
              "rounded-pill px-4 py-2 text-caption font-medium transition-colors",
              filter === "All"
                ? "bg-snow-white text-graphite-surface"
                : "text-bone hairline hover:bg-muted",
            )}
          >
            <HugeiconsIcon icon={More01Icon} size={14} strokeWidth={1.6} />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((card) => (
            <article
              key={card.title}
              className="group overflow-hidden rounded-card bg-graphite-surface hairline transition-colors hover:bg-muted"
            >
              <div className="relative h-40 w-full" style={{ background: card.thumbnail }}>
                <div className="absolute inset-0 bg-gradient-to-t from-graphite-surface to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-pill bg-void-canvas/60 px-2.5 py-1 text-caption font-medium uppercase tracking-[0.16em] text-snow-white backdrop-blur-sm">
                  <HugeiconsIcon icon={card.icon} size={12} strokeWidth={1.6} />
                  {card.type}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-body-lg font-medium text-snow-white transition-colors group-hover:text-bone">
                  {card.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
