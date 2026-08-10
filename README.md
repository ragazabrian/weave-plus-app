# weave+

A team knowledge base + course platform: a collaborative, linked-notes workspace (Obsidian-style) combined with a lightweight course/LMS layer, plus an AI agent that can read and act across a user's notes and courses. Three roles — Admin, Lecturer, Student — share the same route tree, with each URL rendering differently by role.

[**View the source**](https://github.com/ragazabrian/weave-plus-app) · [**Read the build prompt**](PROMPT.md) · Live link: coming soon on Render

## What it does

- **Dashboard** — an agent-curated priority feed plus role-aware stats and recent activity, not a plain due-date sort.
- **Notes** — a linked-notes vault with tags, backlinks, and version history (graph view is a placeholder for now).
- **Courses** — course home, announcements, modules (as an expandable accordion), assignments/submissions, and progress/gradebook, all scoped by role.
- **Canvas** — a list of collaborative whiteboards (the live multiplayer surface itself is a placeholder for now).
- **Calendar / Inbox** — merged deadlines and message threads, kept quiet and information-dense.
- **Agent** — a chat panel scoped to what the signed-in role can access, plus an activity log for Admin/Lecturer.
- **Members / Settings** — workspace roster and configuration, scoped by role (absent entirely for Students).

This build is UI-first: every screen runs on realistic mock data with a role switcher in the sidebar (no backend wiring yet — see "What's not wired up yet" below).

## Design system

Built against a fixed token set: a pale sky-blue canvas, near-black filled buttons as the only dense visual weight, rounded shapes throughout (16px minimum radius), and pastel washes (lavender, mint, powder, solar) reserved for category variety. No box-shadow on content cards — depth comes only from the canvas-to-card color shift. Full token values live in `app/globals.css`, wired into Tailwind v4's `@theme`.

The type scale calls for **Aeonik** (headings) and **Geist** (body/UI). Geist loads via `next/font/google`; Aeonik has no freely licensed source, so it falls back to Geist/system-ui until a licensed font file is added.

## How it is made

Next.js 16 (App Router, TypeScript), Tailwind CSS v4. Role-based rendering is driven by a client-side `RoleProvider` (no auth yet — see below). All content comes from `lib/mock-data.ts`.

## What's not wired up yet

This is the UI/design pass. Not yet implemented:
- Real auth (Supabase Auth / Clerk) — role is a local dev switcher, not a real session.
- A real database (Supabase/Neon + pgvector).
- Real-time collaborative editing (Tiptap + Yjs/Hocuspocus) and the live multiplayer whiteboard (tldraw).
- A real AI agent backed by the Claude API.

## Run locally

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000).

## Deploy

The repo includes a `render.yaml` blueprint for [Render](https://render.com):

1. Push changes to `main`.
2. On Render, create a new **Blueprint** deploy from this repository — it picks up `render.yaml` automatically (Node runtime, `npm run build` / `npm start`).

## Project structure

```text
weave+ app/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                  # redirects to /dashboard
│   └── (app)/
│       ├── layout.tsx            # sidebar + shell
│       ├── dashboard/
│       ├── notes/[id]/, graph/, tags/
│       ├── courses/[id]/, [id]/settings/
│       ├── canvas/[id]/
│       ├── calendar/
│       ├── inbox/
│       ├── agent/
│       ├── members/
│       └── settings/
├── components/
│   ├── ui/                       # Card, Button, PillTag, Accordion, ...
│   ├── layout/Sidebar.tsx
│   └── course/CourseDetail.tsx
├── lib/
│   ├── types.ts
│   ├── mock-data.ts
│   └── role-context.tsx
└── render.yaml
```

## License

Released under the [MIT License](LICENSE).
