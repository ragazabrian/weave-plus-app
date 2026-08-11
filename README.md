# weave+

A team knowledge base + course platform: a collaborative, linked-notes workspace (Obsidian-style) combined with a lightweight course/LMS layer, plus an AI agent that can read and act across a user's notes and courses. Three roles — Admin, Lecturer, Student — share the same route tree, with each URL rendering differently by role.

[**View the source**](https://github.com/ragazabrian/weave-plus-app) · [**Read the build prompt**](PROMPT.md) · [**Live**](https://weave-plus-app.vercel.app)

## What it does

- **Dashboard** — an agent-curated priority feed plus role-aware stats and recent activity.
- **Notes** — a linked-notes vault with tags, backlinks, version history, and a graph view.
- **Courses** — course home, announcements, modules, assignments/submissions, quizzes, discussions, rubrics, and a gradebook, all scoped by role.
- **Canvas** — a real multiplayer whiteboard (tldraw).
- **Calendar / Inbox / Meetings** — merged deadlines, message threads, and scheduled meetings.
- **Agent** — a chat panel that can search and act on the signed-in user's notes and courses, plus an activity log.
- **Members / Settings** — workspace roster and configuration, scoped by role.

Real accounts (Auth0/Google OAuth), a real Postgres database (Supabase), and a real AI backend — this is a working product, not a mock.

## How it is made

[TanStack Start](https://tanstack.com/start) (React, full-stack, SSR) + TypeScript + Tailwind CSS v4, on top of Supabase (Postgres, auth, storage) and an OpenAI-compatible AI SDK for the agent layer. Originally built with [Lovable](https://lovable.dev); `AGENTS.md` documents the git-history constraint that comes with staying connected to it.

## Run locally

Requires Node.js and npm.

```sh
git clone https://github.com/ragazabrian/weave-plus-app.git
cd weave-plus-app
npm install
npm run dev
```

## Running this repo on your own infrastructure

Every integration talks to the provider directly using standard credentials, so
nothing here depends on a Lovable-hosted service. Copy `.env.example` to `.env`
and fill in what you use:

| Feature | Variables | Notes |
| --- | --- | --- |
| Database and auth | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Any Supabase project; migrations live in `supabase/migrations` (`supabase link` + `supabase db push`). |
| Agent and priority feed | `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | Any OpenAI compatible endpoint (OpenAI, OpenRouter, Azure, self hosted). |
| Onboarding log to Google Sheets | `GOOGLE_SERVICE_ACCOUNT_JSON` (or `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`), `GOOGLE_SHEETS_SPREADSHEET_ID` | Enable the Sheets API, then share the sheet with the service account as an Editor. |
| Per user Google connections | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `APP_USER_CONNECTION_KEY_SECRET` | Register `https://your-domain/oauth/google/return` as an authorized redirect URI. Refresh tokens are stored encrypted. |

`.env` is git-ignored — never commit real credentials.

## Deploy

Live at https://weave-plus-app.vercel.app, deployed to Vercel (Nitro's `vercel` preset, `.vercel/output` Build Output API) via `vercel --prebuilt`. The project is linked to this GitHub repo, so Vercel's own Git integration can also build and deploy pushes directly.

Two toolchain fixes were needed to get a working production build, independent of which host you target:

- **`vite` is pinned to `7.3.6`**, not the `^8` the export shipped with. Vite 8 production builds crash every request: two generated SSR chunks import from each other, and `createCsrfMiddleware` comes back `undefined` across that circular boundary. `npm run dev` is unaffected since dev mode doesn't go through this bundling path, and no dependency here (`@tanstack/react-start`, `@tailwindcss/vite`) declares Vite 8 support yet.
- **`cloudflare:workers` is externalized** in `vite.config.ts` — `@lovable.dev/mcp-js` has a Cloudflare-only code path that Rollup can't resolve when targeting a non-Cloudflare preset (dead code off that platform).

An earlier deploy also exists on Cloudflare Workers at https://ragazabrian-weave-plus-app.ragazabrian-8fa.workers.dev (set `nitro.preset` back to `cloudflare-module` to rebuild for that target).

Required secrets are set directly on the hosting platform (`vercel env add` / `wrangler secret put`), not in this repo: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. The AI agent and Google integrations need their own vars added the same way before those features work — see the table above.

## Project structure

```text
weave+ app/
├── src/
│   ├── routes/                   # TanStack Router file-based routes
│   │   ├── _authenticated/       # dashboard, courses, notes, canvas, agent, ...
│   │   ├── auth.tsx
│   │   └── onboarding.tsx
│   ├── components/                # dashboard-view, app-shell, agent-chat, canvas-board, ui/
│   ├── integrations/supabase/
│   ├── server/                    # Google OAuth, connection-key crypto
│   ├── server.ts                  # SSR entry (fetch handler)
│   └── start.ts                   # CSRF + auth middleware
├── supabase/
│   ├── config.toml
│   └── migrations/
├── PROMPT.md                      # original design/build spec
└── vite.config.ts
```

## License

Released under the [MIT License](LICENSE).
