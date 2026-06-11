# AGENTS.md — `mcp-pj`

This file is the entry point for LLM coding agents working in this repository.
Read it first. It complements (does not replace) `README.md` and
`mcp-architecture.md`, which are the human-facing references.

**Domain glossary** → [`CONTEXT.md`](CONTEXT.md). **Per-project rules** →
`*/AGENTS.md` (listed below).

For per-project agent rules, see also:

- `chat-agent/AGENTS.md` — chat agent specifics + MCP canonical-docs policy
- `uni-booking/AGENTS.md`, `uni-registration/AGENTS.md` — traditional UI app rules
- `home/AGENTS.md` — research hub (survey, analysis, My study results)

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
  actions through **MCP tools** exposed by an MCP server. Optionally, it can
  render **OpenUI Lang** blocks in assistant replies as structured UI
  (feature-flagged via `NEXT_PUBLIC_OPENUI_RENDERING`, off by default).

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
├── chat-agent/          Next.js 16 chat UI + /api/chat (MCP client, Gemini, optional OpenUI Lang)
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
  `react-markdown`, `sonner`, and (when OpenUI rendering is enabled)
  `@openuidev/react-lang`.
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
  - Optional OpenUI rendering: `NEXT_PUBLIC_OPENUI_RENDERING=true`
    (default off; when on, assistant replies may include fenced OpenUI Lang
    blocks rendered as structured UI)
  - Study protocol: `NEXT_PUBLIC_CURRENT_STUDY_PROTOCOL_VERSION` (default
    `v2_criteria`; see §14)
- `uni-booking/`, `uni-registration/`, `home/` `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Study protocol: `NEXT_PUBLIC_CURRENT_STUDY_PROTOCOL_VERSION` (default
    `v2_criteria`; see §14)
- `mcp-server/.env`:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Optional: `PORT=4004`, `MCP_AUTH_TOKEN`
  - Study protocol: `CURRENT_STUDY_PROTOCOL_VERSION` (default `v2_criteria`;
    see §14)

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
- `make db-reset` — **destructive**: drops DB, reapplies all migrations +
  seeds (use only when you need a clean slate or edited an old migration)
- `make db-gen` — regenerates `supabase/types/database.types.ts`
- `make edge-functions` — `supabase functions serve`

### Applying migrations (prefer incremental)

After adding a **new** migration file, apply it incrementally and regenerate
types. **Do not** default to `make db-reset` — that wipes local data and
re-seeds unnecessarily.

| Situation | Local | Remote (linked project) | Then |
| --------- | ----- | --------------------- | ---- |
| New migration file (additive SQL) | `supabase migration up --local` | `supabase migration up --linked` or `supabase db push --linked` | `make db-gen` |
| Edited an already-applied migration, broken migration history, or need fresh seeds | `make db-reset` | repair manually / new migration on remote | `make db-gen` |

**Always run `make db-gen`** after the schema changes so
`supabase/types/database.types.ts` stays in sync. Commit the generated types
with the migration.

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
- Chat transcript is Markdown by default. Tool calls are not rendered in the UI.
  When `NEXT_PUBLIC_OPENUI_RENDERING=true`, assistant replies may additionally
  include fenced OpenUI Lang blocks rendered as structured UI via
  `@openuidev/react-lang` (see §9a).
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

## 9a. OpenUI Lang (chat-agent — optional generative UI)

The chat agent includes an **optional, render-only** [OpenUI Lang](https://www.openui.com/)
integration. It is **off by default** (`NEXT_PUBLIC_OPENUI_RENDERING=false`) so
the original Markdown-only study behavior is preserved unless explicitly enabled.

When enabled:

- The API route appends a generated OpenUI instruction block to the system
  prompt (`getOpenUISystemPrompt()` in `src/lib/openui/openui-system-prompt.ts`).
- The model may emit at most one fenced code block tagged `openui` per reply; surrounding
  text stays Markdown.
- `OpenUIAwareContent` splits assistant text into Markdown + OpenUI segments;
  `OpenUIMessage` renders OpenUI Lang via `@openuidev/react-lang`'s `Renderer`.

Key paths:

- `src/lib/openui/chat-library.tsx` — Zod-schemas + React renderers (`defineComponent`)
- `src/lib/openui/extract-openui-block.ts` — fence parsing (incl. streaming)
- `src/lib/openui/openui-config.ts` — feature flag + fence lang constant
- `scripts/generate-openui-prompt.mts` → `src/generated/openui-system-prompt.ts`
  (build-time prompt; run `pnpm generate:openui-prompt` after library changes)

Rules for agents:

- **Do not enable OpenUI by default** in env examples or deploy config unless
  the user asks — it changes the conversational modality's presentation layer.
- OpenUI is **presentation only**; task mutations still go through MCP tools
  (or the non-MCP fallback). Do not add direct Supabase writes via OpenUI actions.
- Regenerate the system prompt after changing `chatOpenUILibrary` or prompt options.
- Canonical OpenUI docs: https://www.openui.com/ (see `.claude/skills/openui/SKILL.md`).

---

## 9b. The `home/` app (research hub — easy to overlook)

`home/` is **not just a landing page**. It is the research-facing
front-end where the experiment lifecycle lives for participants and
researchers (survey instrument, analysis dashboards, **My study results**
at `/survey/history`). See **`home/AGENTS.md`** for routes, study-protocol
switchers, compare-view components, and home-specific UI quirks.

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
- After schema changes: `supabase migration up --local` (or `make db-reset`
  only when a full re-seed is required), then `make db-gen`, before pushing.

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
- **New migration ≠ `make db-reset`.** Use `supabase migration up --local`
  for additive migrations; reserve `make db-reset` for when you need seeds
  reapplied or migration history is inconsistent.
- **Render deploy** is configured by `render.yaml` — changes to ports,
  start commands, or env vars likely need a matching update there.
- **OpenUI is feature-flagged** — `NEXT_PUBLIC_OPENUI_RENDERING` defaults
  off; the OpenUI bundle is lazy-loaded only when the flag is on. Changing
  `chatOpenUILibrary` requires `pnpm generate:openui-prompt` (also runs in
  `prebuild`).
- **Preview deployments** — all four Next.js apps detect preview via
  `VERCEL_ENV=preview` or `preview.*` hostnames, show a fixed banner, and
  rewrite cross-app URLs (e.g. survey links) to the preview origin. See
  `*/src/lib/preview-environment.ts`.
- **Dual study protocol versions** — `task_progress`, `task_survey_responses`,
  and `task_interview_responses` carry a `protocol_version` column; v1 and
  v2 rows coexist per participant. Active writes use
  `CURRENT_STUDY_PROTOCOL_VERSION` from env (§14).

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
- **`research.json` is the frozen v1 paper snapshot** — do not rewrite it
  to reflect v2_criteria behavior. Analysis and research pages use
  protocol switchers (`v1` / `v2` route slugs) to filter cohorts.
- **My study results compare view** — metrics shown side-by-side for
  `v1_simple` and `v2_criteria` must stay consistent across modalities;
  see `CONTEXT.md` for canonical terms.

---

## 14. Study protocol and task mode

Domain terms (`v1_simple`, `v2_criteria`, task assignment set, My study
results) are defined in [`CONTEXT.md`](CONTEXT.md). This section covers
operational facts for agents.

- **Active protocol** — each app exports `CURRENT_STUDY_PROTOCOL_VERSION`
  from its `study-protocol.ts` (or `home/src/utils/study-protocol.ts`),
  parsed from `NEXT_PUBLIC_CURRENT_STUDY_PROTOCOL_VERSION` (Next.js) or
  `CURRENT_STUDY_PROTOCOL_VERSION` (`mcp-server`). Default: `v2_criteria`.
- **Coexisting rows** — `protocol_version` on `task_progress`,
  `task_survey_responses`, and `task_interview_responses` lets v1 and v2
  participation records live side by side for the same user. **v1_simple
  rows are frozen** — do not mutate or reset them when changing v2 behavior.
- **Task assignment** — under `v2_criteria`, each user gets one row in
  `task_user_assignments` pointing at a seeded `task_assignment_sets` row
  (assigned at survey start in `home/src/app/actions/survey.ts`). Both
  modalities share the same assignment for that user.
- **Criteria verification** — on task completion, MCP tool handlers
  (`mcp-server/src/tools/courses.ts`, `facilities.ts`) and traditional
  server actions (`uni-*/src/app/actions/`) verify the action matches the
  user's assignment criteria. Shared helpers: `task-criteria.ts` in each
  app; `mcp-server/src/lib/task-criteria.ts`.
- **Task mode scaffolding** — session/progress tracking via
  `task-mode-client.ts` and `task-mode-server.ts` in each task app;
  `mcp-server/src/lib/task-mode.ts` on the server. All filter by
  `CURRENT_STUDY_PROTOCOL_VERSION`.
- **Modality parity** — criteria logic and task-mode behavior must stay
  aligned across `chat-agent`, `uni-booking`, `uni-registration`, and
  `mcp-server` for the active protocol version.

---

## 15. Quick contact

**Author**: Kyaw Kyaw Oo — Department of Mathematics and Computer Science,
Chulalongkorn University. Email: `kyawkyawjek@gmail.com`.
