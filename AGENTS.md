# AGENTS.md — `mcp-pj`

This file is the entry point for LLM coding agents working in this repository.
Read it first. It complements (does not replace) `README.md` and
`mcp-architecture.md`, which are the human-facing references.

For per-project agent rules, see also:

- `chat-agent/AGENTS.md` — chat agent specifics + MCP canonical-docs policy
- `uni-booking/AGENTS.md`, `uni-registration/AGENTS.md` — traditional UI app rules

---

## 1. What this repo is

`mcp-pj` is the **prototype + research artifact** for the study:

> *"Comparing Intent-Driven and Interface-Driven Interaction: An Empirical
> Study of Traditional UI and Conversational AI Using the Model Context
> Protocol (MCP)."*

It implements **two interaction modalities for the same task scenarios**
(university course registration + facility booking) on top of a **single
shared Supabase backend**, so that experimental differences come from the
**interaction modality**, not the underlying data/logic.

- **Traditional modality**: standard web UIs (forms, buttons, navigation).
- **Conversational modality**: a Gemini-powered chat agent that executes
  actions through **MCP tools** exposed by an MCP server.

Experimental tasks: register course, drop course, book facility, cancel
booking. The same Postgres schema, business logic, and seed data back
both modalities.

When making changes, **preserve modality parity**: any feature/data change
must keep both the traditional UIs and the chat agent able to complete the
four core tasks against the same Supabase data.

---

## 2. Top-level structure

```
mcp-pj/
├── chat-agent/          Next.js 16 chat UI + /api/chat (MCP client, Gemini)
├── mcp-server/          Bun MCP server exposing university tools (port 4004)
├── uni-booking/         Next.js traditional UI — facility booking (port 4001)
├── uni-registration/    Next.js traditional UI — course registration (port 4002)
├── home/                Next.js research hub: landing + survey + analysis + stats (port 4003)
├── supabase/            Local Postgres: migrations, seeds, edge functions, types
├── Makefile             Orchestration for setup / dev / db
├── README.md            Human-facing setup + research summary
├── mcp-architecture.md  Mermaid diagrams of the MCP wiring
└── render.yaml          Render.com deploy config
```

Each Next.js app is an independent pnpm project (no workspace). The MCP
server uses **Bun**, not Node.

---

## 3. Architecture (must-know)

```
                  ┌────────────────────────── Supabase (Postgres :34567) ──────────────────────────┐
                  │   migrations + seeds + types + edge functions (analysis)                       │
                  └────────────────────────────────────────────────────────────────────────────────┘
                          ▲ anon key (RLS)                              ▲ service role key
                          │                                             │
   ┌──────── traditional modality ────────┐               ┌────────── conversational modality ──────────┐
   │ uni-booking (4001)                   │               │ chat-agent (4000)                            │
   │ uni-registration (4002)              │               │   /api/chat → Vercel AI SDK + Gemini         │
   │ home (4003)                          │               │   MCP client (HTTP transport, SSE)           │
   │   Supabase JS client (browser/SSR)   │               │            │                                 │
   └──────────────────────────────────────┘               │            ▼                                 │
                                                          │ mcp-server (Bun :4004/mcp)                   │
                                                          │   tools/courses.ts, tools/facilities.ts      │
                                                          │   service-role Supabase client               │
                                                          └──────────────────────────────────────────────┘
```

Key invariants:

- **Service role key never leaves the server.** Only `mcp-server` (and
  Supabase edge functions) hold `SUPABASE_SERVICE_ROLE_KEY`. Browsers and
  the Next.js client bundles must only ever see the anon key.
- **MCP is the only path the chat agent uses to mutate data.** Do not add
  direct Supabase writes from `chat-agent` for task-related actions —
  those must go through MCP tools so the experiment stays clean.
- **Both modalities share the same schema and seeds.** New behavior must
  be expressed both as MCP tool(s) *and* as traditional-UI flow(s) when
  the change affects user-facing tasks.

See `mcp-architecture.md` for the full mermaid diagrams (high-level
architecture + MCP request sequence).

---

## 4. Tech stack

- **Frontends**: Next.js 16, React 19, TypeScript, TailwindCSS v4,
  shadcn/ui (Radix primitives), `react-hook-form` + `zod`, `next-themes`,
  Sentry. The chat agent additionally uses `@ai-sdk/react`, `zustand`,
  `react-markdown`, and `sonner`.
- **AI / MCP**: Vercel AI SDK (`ai` v6), `@ai-sdk/google`, `@ai-sdk/mcp`
  (HTTP transport), `@modelcontextprotocol/sdk` on the server.
- **Backend**: Supabase (Postgres + Auth + edge functions). Generated
  types live at `supabase/types/database.types.ts`.
- **Tooling**: pnpm for every Next.js app, Bun for `mcp-server`, Make for
  orchestration, ESLint + `eslint-config-next`, Jest + Testing Library
  (chat-agent only).

**Always use `pnpm` in the four Next.js projects and `bun` in
`mcp-server`.** Do not switch package managers.

---

## 5. Local URLs & ports

| Service                     | URL                              |
| --------------------------- | -------------------------------- |
| Chat agent                  | http://localhost:4000            |
| Facility booking UI         | http://localhost:4001            |
| Course registration UI      | http://localhost:4002            |
| Home / research UI          | http://localhost:4003            |
| MCP server                  | http://localhost:4004/mcp        |
| Supabase API                | http://127.0.0.1:23456           |
| Postgres                    | 127.0.0.1:34567                  |
| Supabase Studio             | http://127.0.0.1:56789           |

Non-standard Supabase ports are configured in `supabase/config.toml` —
keep them in sync with app `.env.local` files.

---

## 6. Environment & secrets

Each app reads its own `.env.local` (or `.env` for `mcp-server`).
`make env-init` copies from `.env.example` files non-destructively.

Required:

- `chat-agent/.env.local`:
  - `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional MCP toggle: `USE_MCP=true`, `MCP_SERVER_URL=http://localhost:4004/mcp`,
    `MCP_AUTH_TOKEN=...`
  - Optional model override: `NEXT_PUBLIC_GOOGLE_GENERATIVE_MODEL_ID`
    (default `gemini-2.5-flash`)
- `uni-booking/`, `uni-registration/`, `home/` `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `mcp-server/.env`:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Optional: `PORT=4004`, `MCP_AUTH_TOKEN`

Rules:

- **Never** add the service role key to a Next.js `.env.local` or to any
  `NEXT_PUBLIC_*` variable.
- **Never** commit `.env`, `.env.local`, or any file with real keys.
- The chat agent has a "no MCP" fallback (direct tools); when adding MCP
  tools, also keep that path working unless explicitly told otherwise.

---

## 7. Make commands

Use these whenever possible instead of running raw subcommands:

- `make setup` — env-init + install + Supabase start + db reset + type-gen
- `make install` — install all deps (`pnpm` × 4 + `bun install`)
- `make dev` — runs all 6 services in parallel (`-j6`); prints `LOCAL_IP` for LAN device testing
- `make ip` — prints LAN IPv4 only (`LOCAL_IP`: macOS `ipconfig getifaddr en0` + fallbacks; Windows active adapter via PowerShell)
- `make db-start` / `db-stop` / `db-status`
- `make db-reset` — re-applies migrations + seeds (destructive locally)
- `make db-gen` — regenerates `supabase/types/database.types.ts`
- `make edge-functions` — `supabase functions serve`

After any migration change, **always run `make db-reset` and
`make db-gen`** so the generated types stay in sync with the schema.

---

## 8. Database conventions

- Migrations: `supabase/migrations/` (timestamp-prefixed SQL). Add a new
  file rather than editing existing ones.
- Seeds: `supabase/seeds/` — courses/facilities, tasks/surveys, mock
  analysis. Seeds must keep both modalities runnable end-to-end.
- Types: `supabase/types/database.types.ts` is **generated**; never hand-edit.
- Auth: Supabase Auth. The chat agent injects the authenticated user's
  UUID into the system prompt so MCP tools always act on behalf of the
  current user.
- RLS lives in migrations; the MCP server intentionally bypasses RLS via
  the service role and must therefore validate the acting user explicitly
  in tool handlers.

---

## 9. Chat agent / MCP specifics

- API route: `chat-agent/src/app/api/chat/` uses `streamText` from the
  Vercel AI SDK with Gemini as the model and an MCP client (HTTP
  transport) pointed at `mcp-server`.
- Tool definitions live in `chat-agent/src/lib/tool-definitions.tsx`
  (UI rendering for tool invocations) and `chat-agent/src/lib/tools.ts`
  (non-MCP fallback). Server tools live in `mcp-server/src/tools/`
  (`courses.ts`, `facilities.ts`).
- Chat transcript is text-only (markdown bubbles); tool calls are not rendered in the UI.
- "Task mode" (research-experiment scaffolding) is shared between
  client (`task-mode-client.ts`) and server (`task-mode-server.ts`,
  `mcp-server/src/lib/task-mode.ts`).
- Per `chat-agent/AGENTS.md`, **MCP-spec questions resolve against
  https://modelcontextprotocol.io/ as of 2025-11-25**. Newer behavior must
  be flagged explicitly.

When adding a new MCP tool:

1. Define it in `mcp-server/src/tools/<domain>.ts` with a `zod` schema.
2. Validate the acting user inside the handler (do not trust client args).
3. Mirror UI rendering in `chat-agent/src/lib/tool-definitions.tsx` so
   tool calls render meaningfully in the transcript.
4. If the tool changes user-visible task state, ensure the equivalent
   action exists in the corresponding traditional UI app.

---

## 9b. The `home/` app (research hub — easy to overlook)

`home/` is **not just a landing page**. It is the research-facing
front-end and the place where the experiment lifecycle actually lives
for participants and researchers:

- `src/app/page.tsx` — landing / entry into the study.
- `src/app/research/` — research description, protocol, consent
  material. Backed by `src/data/research.json`.
- `src/app/survey/` — participant survey flow (SUS, NASA Raw-TLX,
  SDT-based items, preference questions). Writes to the survey tables
  seeded by `supabase/seeds/tasks_surveys.sql`.
- `src/app/analysis/` — researcher-side analysis dashboards backed by
  the `analysis` Supabase edge function (`supabase/functions/analysis`)
  and the `z_mock_analysis_data.sql` seed.
- `src/app/statistics/` — aggregate stats views (uses `recharts` and
  `simple-statistics` for client-side computation).
- `src/app/auth/`, `src/app/settings/`, `src/app/api/` — shared auth /
  account / API surface.

Quirks specific to `home/`:

- **Different UI substrate from the other apps.** `home/` uses
  `@base-ui/react` + a much wider Radix footprint (accordion, carousel,
  resizable panels, day-picker, toast, etc.), `recharts`, and
  `react-json-view-lite`. Don't assume a component exists in `home/`
  just because it exists in `chat-agent/` — and vice versa.
- **Has its own `pnpm-workspace.yaml`** while the other Next.js apps
  do not. Treat `home/` as a self-contained pnpm root.
- **Older versions of some libs** (Sonner v1, Zod v3, `@hookform/resolvers`
  v3, older Radix majors). Don't blindly upgrade to match `chat-agent/`
  — survey/analysis pages have been validated against these versions.
- **Talks to the `analysis` edge function**, so changes there must be
  paired with `supabase/functions/analysis` updates and re-served via
  `make edge-functions`.
- **Owns the "research truth"**: any change that affects what
  participants see, the survey instrument, or how results are
  aggregated has experimental implications — see §13.

When in doubt: research / survey / stats / analytics work belongs in
`home/`. Task execution (registration, booking, chat) belongs in the
other four apps.

---

## 10. Frontend conventions (all Next.js apps)

- **UI**: shadcn/ui components in `src/components/ui/`. Reuse before
  adding. Match existing patterns; do not introduce a second component
  library.
- **Styling**: Tailwind v4 utility classes; tokens from `globals.css`.
  Honor light/dark mode (`next-themes`).
- **Forms**: `react-hook-form` + `zod` resolvers. No ad-hoc form state.
- **Data**: Supabase JS client. Server-only secrets stay server-side.
  Reference `supabase/types/database.types.ts` for types — do not invent
  parallel types.
- **Routing**: Next.js App Router. Server components by default; mark
  `'use client'` only when needed.
- **Errors**: Sentry is wired (`sentry.*.config.ts` + `instrumentation*`).
  Don't bypass it with bare `console.error` for production paths.
- **Accessibility / consistency**: per per-app `AGENTS.md`, keep UI
  consistent within each app and follow the existing patterns rather than
  introducing one-off styles.

---

## 11. Testing & quality

- Lint: `pnpm lint` inside each Next.js app.
- Tests: only `chat-agent` ships Jest + Testing Library; co-locate tests
  with the unit under test or under `__tests__/`.
- Type-check: `tsc` runs as part of `next build`. After non-trivial
  edits, run `pnpm build` (or at minimum `pnpm lint`) in the affected app.
- After schema changes: `make db-reset && make db-gen` before pushing.

---

## 12. Things that often surprise agents

- **Two package managers in one repo** — pnpm (Next.js apps) + Bun (MCP
  server). Don't unify them.
- **No pnpm workspace at root** — `home/` has its own
  `pnpm-workspace.yaml`, but the repo is otherwise loose. Run installs
  per project (or use `make install`).
- **Custom Supabase ports** (23456 / 34567 / 56789) — `supabase status`
  output and app `.env.local`s must agree.
- **MCP can be toggled off** via `USE_MCP=false`; keep both paths working.
- **`@ai-sdk/mcp` uses HTTP transport with SSE** to talk to the Bun
  server — not stdio. Don't switch transports without updating both ends.
- **`zod` versions differ** between `chat-agent` (v4) and `mcp-server`
  (v3). Don't share schemas across the boundary; serialize over MCP.
- **Generated types are committed.** `database.types.ts` regeneration
  produces a real diff after schema work; commit it with the migration.
- **Render deploy** is configured by `render.yaml` — changes to ports,
  start commands, or env vars likely need a matching update there.

---

## 13. Research hygiene

This is a research artifact. Some changes have experimental implications:

- Don't alter seeded tasks, surveys, or task ordering without a clear
  reason — they map to the experimental protocol.
- Don't change the wording/behavior that affects how participants compare
  modalities (e.g., system prompt scope, tool surface area, success
  messages) without flagging it.
- Analytics tables (`task_mode_*`, analysis edge function) record
  experiment data; treat them as append-only from app code.

---

## 14. Quick contact

**Author**: Kyaw Kyaw Oo — Department of Mathematics and Computer Science,
Chulalongkorn University. Email: `kyawkyawjek@gmail.com`.
