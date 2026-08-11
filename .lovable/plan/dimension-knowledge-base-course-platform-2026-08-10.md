# Dimension — knowledge base + course platform

A role-aware workspace combining linked notes, a whiteboard, a course/LMS layer, and an AI agent. Built on Lovable Cloud (Postgres + auth) with real sign-in and server-side roles.

## Two adjustments to the brief

1. **Framework**: this project runs on TanStack Start (React 19 + Vite), not Next.js. Everything else in the brief — the token system, sitemap, role model — carries over unchanged; server logic uses TanStack server functions instead of Next route handlers.
2. **Fonts**: Geist at weight 500 for headings and body, per your answer. Aeonik is not used.

Real-time multiplayer via a Yjs/Hocuspocus websocket server needs an always-on host, which isn't available here. Instead: live presence + live document sync through Cloud's realtime channels, with the note/canvas state persisted to Postgres. Same collaborative feel, no extra infrastructure. Concurrent character-level merging in a single paragraph is the one thing this trades away.

## Design system

Tokens from section 4.2 go into `src/styles.css` as the project's semantic token layer: sky-tint canvas, bone-white cards, charcoal as the only filled-button color, the four pastel washes, 16/24/32px radii, the two allowed shadows, and the type scale. Every component is built from these tokens only — no new colors, radii, or shadows. Hard rules from 4.4 (no bold above 500, no card shadows, 16px minimum radius, max two pastels per screen, compressed app-density spacing) are applied as I build each screen, not retrofitted.

## Roles and access

- Sign up / sign in with email + password and Google.
- Roles live in a separate `user_roles` table (admin / lecturer / student) checked by a security-definer function — never on the profile row.
- One route tree; the sidebar omits Members and workspace Settings entirely for students.
- Row-level security scopes every read to what the role may see: admins all, lecturers their owned courses, students their enrollments and own notes. Server-side, not just hidden UI.
- The first account to sign up becomes admin so you can then invite/assign the others.

## Screens

**Sidebar** — plain-text nav, lavender pill behind the active item, logo top-left, role-conditional entries.

**Dashboard** — command center at the top: a 3–4 stat vault overview row, then an agent-generated priority feed (3–5 items, severity pill + action title + a one-line "why" that cites real data such as deadline proximity or drop-off rate), with a Refresh all ghost button. Below it: continue-editing and assigned-to-you compact card lists. Feed content differs per role (cross-course risk / ungraded-aged-by-urgency / at-risk deadlines + cohort pace).

**Notes** — vault list, tag browser, note detail with editor, backlinks panel from `[[wikilinks]]`, and version history. Graph view renders the link network.

**Canvas** — canvas list and a multiplayer whiteboard (tldraw), state saved per canvas.

**Courses** — role-scoped list with pastel subject tiles; course detail tabs for Home, Announcements, Modules (accordion rows with the grid-rows transition), Assignments → Submissions (grade/feedback vs submit/view), and Gradebook or My progress. Course settings for admin/lecturer.

**Calendar** — merged deadlines, quiet alternating mist-gray/bone-white rows.

**Inbox** — direct and course-scoped threads, same quiet utility styling.

**Agent** — chat on a bone-white 32px panel, scoped to what the signed-in user can access, powered by Lovable AI. Activity log for admin/lecturer.

**Members** — roster with role assignment (admin) or own-course roster (lecturer).

**Settings** — workspace + integrations for admin, account-only for others.

## Data model

`profiles`, `user_roles`, `courses`, `enrollments`, `modules`, `module_items`, `assignments`, `submissions`, `announcements`, `notes`, `note_links`, `note_versions`, `tags`, `canvases`, `calendar_events`, `threads`, `messages`, `agent_runs`. Every table gets RLS plus explicit grants and role-scoped policies.

Seeded demo content ships with the schema — a few courses across subject categories, modules, assignments with varied due dates, submissions in mixed grading states, notes with links, and announcements — so every screen has something real to render and the priority feed has data to reason over.

## Build order

1. Cloud enabled, schema + RLS + seed data, auth pages, role plumbing.
2. Token system and shared primitives (buttons, cards, pills, stat blocks, accordion, pastel tiles).
3. Sidebar shell with role-conditional nav.
4. Dashboard, then Course detail, then Notes (editor + backlinks + graph), then Canvas, Agent, and Calendar/Inbox/Members/Settings.

## Notes

- Agent replies and priority-feed reasoning run server-side through Lovable AI; nothing is templated or mocked.
- This is a large build — I'll work through it in the order above so you can see and react to each layer as it lands rather than waiting for everything at once.
