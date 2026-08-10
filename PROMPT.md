# Build prompt — team knowledge base + course platform ("Dimension" visual system)

Use this prompt as-is with a coding agent (Claude Code, Cursor, v0). It defines the product, the three user roles, the full navigation, and the exact design tokens to build against. Do not invent colors, fonts, radii, or spacing outside what's specified below.

---

## 1. Product summary

Build a web app that combines a collaborative, linked-notes workspace (Obsidian-style) with a lightweight course/LMS layer (Canvas-competitor), plus an AI agent that can read and act across a user's notes and courses. Real-time multiplayer editing is core, not an add-on. Free tier only for v1 — no paid infrastructure assumptions.

**Three roles, one route tree** — the same URLs render differently by role rather than branching into separate apps:

- **Admin** — full workspace control: all courses, all members, role assignment, billing/settings.
- **Lecturer** — owns specific courses: builds modules, creates assignments, grades submissions, posts announcements. Scoped to courses they teach.
- **Student** — enrolled-only view: completes modules, submits assignments, reads announcements. Scoped to courses they're enrolled in and their own notes.

---

## 2. Navigation (global, all roles)

Persistent left sidebar: **Dashboard · Notes · Canvas · Courses · Calendar · Inbox · Agent · Members · Settings**

Members and workspace-level Settings do not render at all for Students (not shown disabled — simply absent).

## 3. Full sitemap

```
Dashboard
 ├─ Activity feed (scoped by role)
 ├─ Assigned to you / awaiting your grading (role-dependent)
 └─ Continue editing (recent notes)

Notes
 ├─ All notes (Admin/Lecturer: full or owned vault; Student: personal only)
 ├─ Graph view
 ├─ Tags
 └─ Note detail → editor, backlinks panel, version history

Canvas (whiteboard)
 ├─ All canvases (scoped by role)
 └─ Canvas detail (multiplayer whiteboard)

Courses
 ├─ Course list (Admin: all; Lecturer: owned; Student: enrolled)
 ├─ Course detail
 │   ├─ Home
 │   ├─ Announcements (Lecturer/Admin post, Student reads)
 │   ├─ Modules (ordered note sequences)
 │   ├─ Assignments
 │   │   └─ Submissions (Lecturer: grade/feedback view; Student: submit/view feedback)
 │   └─ Progress / Gradebook (Lecturer/Admin) or My progress (Student)
 └─ Course settings (Admin/Lecturer)

Calendar — merged deadlines across all courses the user can see
Inbox — direct + course-scoped message threads

Agent
 ├─ Chat scoped to what the user can access
 └─ Agent activity log (Admin/Lecturer only)

Members (Admin: full roster + roles; Lecturer: own course roster; absent for Student)
Settings (Admin: workspace + billing + integrations; Lecturer/Student: account only)
```

---

## 4. Design system — "Geniestudio"

Light, airy, near-white with pale sky-blue canvas. Dark charcoal is the only dense visual weight (all filled buttons); color otherwise stays in soft pastel washes.

### 4.1 Core principle

> A pale sky-blue canvas hosts an almost-monochrome interface where near-black buttons provide the only dense visual weight. Rounded shapes dominate — 32px cards, 9999px pills, pastel washes (lavender, mint, peach, powder blue). Depth comes from the canvas-to-card color shift, never box-shadow.

### 4.2 Design tokens (drop into `globals.css` or Tailwind v4 `@theme`)

```css
:root {
  /* Colors */
  --color-sky-tint: #ebf5ff;         /* page canvas — the defining ambient color */
  --color-paper-white: #ffffff;      /* button text, icon fills on dark controls */
  --color-bone-white: #fafdff;       /* primary card surface */
  --color-mist-gray: #f6f7f8;        /* secondary surfaces, dividers */
  --color-ink: #0a0d12;              /* headings, primary display type */
  --color-charcoal: #181d27;         /* filled button background — the dense anchor */
  --color-graphite: #535862;         /* secondary body text */
  --color-fog: #93979f;              /* muted helper text */
  --color-iris-blue: #0069e0;        /* accent — outline/border only, never a fill */
  --color-sky-blue: #0099ff;         /* inline highlight text within body copy */
  --color-lavender-wash: #f1e6ff;    /* pastel tile background */
  --color-mint-wash: #d3f6e3;        /* pastel tile background */
  --color-powder-blue: #cce7ff;      /* pastel tile background */
  --color-solar-wash: #fff2be;       /* pastel tile background */

  /* Fonts */
  --font-aeonik: 'Aeonik', ui-sans-serif, system-ui, sans-serif;
  --font-geist: 'Geist', ui-sans-serif, system-ui, sans-serif;

  /* Type scale — app context uses heading-sm through heading-lg; display/hero are landing-page only */
  --text-caption: 10px;      --leading-caption: 1.4;      --tracking-caption: -0.1px;
  --text-body-sm: 14px;      --leading-body-sm: 1.14;     --tracking-body-sm: -0.14px;
  --text-body: 16px;         --leading-body: 1.35;
  --text-body-lg: 18px;      --leading-body-lg: 1.33;     --tracking-body-lg: -0.18px;
  --text-subheading: 20px;   --leading-subheading: 1.4;   --tracking-subheading: -0.2px;
  --text-heading-sm: 24px;   --leading-heading-sm: 1.17;  --tracking-heading-sm: -0.48px;
  --text-heading: 32px;      --leading-heading: 1.25;     --tracking-heading: -0.64px;
  --text-heading-lg: 48px;   --leading-heading-lg: 1.17;  --tracking-heading-lg: -0.96px;

  /* Spacing (8px base unit) */
  --spacing-8: 8px;   --spacing-16: 16px; --spacing-24: 24px; --spacing-32: 32px;
  --spacing-40: 40px; --spacing-48: 48px; --spacing-56: 56px; --spacing-64: 64px;

  /* Radius */
  --radius-tags: 9999px;
  --radius-inputs: 16px;
  --radius-cards-small: 16px;
  --radius-cards: 32px;
  --radius-images: 24px;
  --radius-buttons: 32px;      /* or 9999px for full pill variant */

  /* Shadows — only these two exist in the system */
  --shadow-button: 0 1px 2px rgba(10,13,18,0.8), 0 0 0 1px #0a0d12;
  --shadow-decorative: 0 14px 20px 4px rgba(4,69,144,0.08);

  /* Accent gradient — border/outline use only */
  --gradient-iris: linear-gradient(rgb(71,157,255) 11.43%, rgb(0,105,224) 78.2%);
}
```

Layout constants: page max-width `1200px`, section gap `80px` (compress to `40–48px` for dense app views — see 4.4), card padding `40px` (compress to `20–24px` for compact app cards), element gap `24px` (compress to `12–16px` in dense lists).

### 4.3 Component specs to implement

| Component | Spec |
|---|---|
| **Sidebar nav item** | Plain text link, Geist 16px weight 500, `--color-ink` (active) or `--color-graphite` (inactive), no background, no border. Active state: small `--color-lavender-wash` pill behind the icon+label. |
| **Primary CTA button** | Filled `--color-charcoal` bg, `--color-paper-white` text, `--radius-buttons`, 12px×32px padding, Geist 16px weight 500, `--shadow-button`. Only one filled button per view. |
| **Secondary/compact button** | Same charcoal fill, `--radius-cards-small` (16px), 8px×16px padding, Geist 14px weight 500. |
| **Card (module, assignment, note preview)** | `--color-bone-white` bg, `--radius-cards` (32px; use `--radius-cards-small` 16px for dense list items), 20–40px padding depending on density, no border, no shadow — relies on the canvas-to-card color shift for depth. |
| **Pastel category tile (course subject tags, module categories)** | Solid pastel bg (lavender/mint/powder/solar), `--radius-cards`, no border, no gradient on the tile itself. |
| **Metric/stat block (dashboard)** | `--color-bone-white` bg, `--radius-cards-small`, label in `--color-fog` 14px, value in `--color-ink` 24–32px Aeonik weight 500. |
| **Pill tag / status chip** | `--radius-tags` (9999px), Geist 12–14px weight 500, 4px×12px padding, pastel-tinted background matching the tag's category. |
| **FAQ-style accordion (use for module lists)** | `--color-bone-white` bg, `--radius-cards`, 20–40px padding, question/title Geist 18–20px weight 500 `--color-ink`, body Geist 16px `--color-fog`, animated with `grid-template-rows` transition at 0.65s ease. |
| **Section header** | Aeonik 24–32px weight 500 `--color-ink` for app section headers (reserve 48px+ for marketing pages only), followed by Geist 16–18px `--color-graphite` description. |
| **Accent border (used sparingly)** | 3px solid `--gradient-iris`, `--radius-full` (90px) — for a single highlighted card only, e.g. "recommended module" or "next up." Never more than one per screen. |

### 4.4 Hard rules — do not violate

- All filled buttons use `--color-charcoal` (#181d27). `--color-iris-blue` never fills a button — outline/border and inline text-highlight only.
- No bold weights (600+) on Aeonik headings — weight 500 is the ceiling everywhere.
- No box-shadow on content cards. Depth comes only from the `--color-sky-tint` → `--color-bone-white` shift.
- Minimum corner radius is 16px anywhere in the UI — no sharp corners, ever.
- Body text never uses `#000000` — use `--color-ink` (#0a0d12), which carries a hint of blue tying back to the canvas.
- No more than two pastel washes visible in a single screen — pastel is for category variety, not decoration density.
- Aeonik's 72px/148px display and hero sizes are reserved for marketing/landing pages — app screens cap at `--text-heading-lg` (48px), and most section headers should sit at 24–32px.
- Compress the marketing-scale spacing (80–120px section gaps, 40px card padding) down for dense app views — use 40–48px section gaps and 20–24px card padding in Dashboard, Course detail, Calendar, and Inbox so the UI doesn't feel oversized for repeated daily use.

---

## 5. Applying the system to specific screens

- **Dashboard — Command center (top of page, above the existing metric row)**: an agent-curated priority feed, not a plain due-date sort. Two parts:
  1. **Vault overview row** — 3–4 stat blocks (per role, see table below), same `--color-bone-white` metric-block styling as the existing dashboard cards.
  2. **Priority feed** — a short, agent-generated list (3–5 items max) below the stats, each item a `--color-bone-white` card with: a severity pill (p0 red / p1 amber / p2 blue — use `--color-solar-wash`/pastel-tinted pill bg with the matching CDS role color for the dot, not the pastel wash itself, so severity stays legible), a one-line action title, and a one-line agent-reasoned "why" underneath in `--color-fog`. Include a manual "Refresh all" ghost button top-right of the section.
  - **Admin feed**: cross-course risk flags (students falling behind, courses missing assignments before their end date).
  - **Lecturer feed**: ungraded submissions aged by urgency + downstream consequence, module drop-off anomalies.
  - **Student feed**: at-risk deadlines + cohort pace comparison.
  - This section replaces a static "Assigned to you" sort with reasoning generated by the agent layer — each item's "why" must reference actual data (deadline proximity, downstream dependency, drop-off rate), never a generic template string.
- **Dashboard (remaining sections)**: `--color-sky-tint` canvas, metric-block row (3-up grid, `--color-bone-white` cards at `--radius-cards-small`), "continue editing" and "assigned to you" as compact card lists (16px radius, tight padding) rather than the marketing-scale 32px/40px treatment.
- **Course detail**: Aeonik 24–32px section header per tab. Modules render as FAQ-style accordion rows (expand/collapse for module content). Announcements render as stacked `--color-bone-white` cards, newest first, with a small pastel "announcement" tag.
- **Agent chat**: `--color-bone-white` panel as the chat surface, `--radius-cards`, no shadow. Agent messages in Geist 16px `--color-ink`; user's own prior turns in `--color-graphite` if visually distinguished.
- **Sidebar/global nav**: plain-text nav (per 4.3), logo top-left, active item gets a small lavender pill behind it — resist the urge to add the marketing nav's centered-link styling, since an app sidebar is vertical and persistent, not a header row.
- **Calendar/Inbox**: `--color-mist-gray` row backgrounds alternating with `--color-bone-white`, no pastel tiles here — these are utility screens, keep them quiet and information-dense.
- **Course subject/category tags**: this is the one place the pastel tile system earns its keep — use lavender/mint/powder/solar consistently per subject area so students can visually scan a course list by category.

---

## 6. Tech stack (free tier only)

Next.js · Tiptap (editor) + Yjs/Hocuspocus (real-time collab) · tldraw (canvas) · Supabase or Neon free tier (Postgres + pgvector) · Supabase Auth or Clerk free tier · Claude API for the agent layer · Tailwind v4 using the `@theme` block above.

---

## 7. Instructions to the coding agent

1. Scaffold the Next.js app with the CSS tokens in section 4.2 wired into `globals.css` and Tailwind `@theme`.
2. Build the sidebar nav first as the Floating Frosted Nav component, with role-based conditional rendering (Members/Settings absent for Student).
3. Build Dashboard, then Course detail (the most role-divergent screen), then Notes, then Calendar/Inbox last (lowest visual complexity).
4. Every new component must be checked against section 4.4 before being considered done — if it introduces a color, radius, or shadow not listed above, stop and flag it rather than inventing one.
