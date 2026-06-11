# Project Rules — `home/`

Research hub for the MCP study: participant survey flow, researcher
analysis, and participant self-review. Domain terms are in
[`../CONTEXT.md`](../CONTEXT.md); cross-app study-protocol and task-mode
rules are in root [`../AGENTS.md`](../AGENTS.md) §14.

## Tech Stack & Tools

- **Package Manager**: Use `pnpm` for all package management commands.
- **UI**: `@base-ui/react` + a wide Radix footprint (accordion, carousel,
  resizable panels, day-picker, toast, etc.), shadcn-style components in
  `src/components/ui/`, `recharts`, `react-json-view-lite`.
- **Forms**: `react-hook-form` + `zod` v3 resolvers (`@hookform/resolvers`
  v3). Do not blindly upgrade to match `chat-agent/` versions.
- **Workspace**: `home/` has its own `pnpm-workspace.yaml`; treat it as a
  self-contained pnpm root.

## Routes

| Path | Purpose |
| ---- | ------- |
| `/` | Landing / study entry |
| `/survey` | Participant survey + task list |
| `/survey/history` | **My study results** — compare view across protocol versions |
| `/research` | Research description, protocol, consent (`src/data/research.json`) |
| `/analysis` | Researcher analysis dashboards (edge function) |
| `/statistics` | Aggregate stats (`recharts`, `simple-statistics`) |
| `/auth/*`, `/settings`, `/api/*` | Auth, account, API surface |

## Study protocol

- **Active version**: `CURRENT_STUDY_PROTOCOL_VERSION` from
  `src/utils/study-protocol.ts` (env:
  `NEXT_PUBLIC_CURRENT_STUDY_PROTOCOL_VERSION`, default `v2_criteria`).
- **Labels and colors**: `src/lib/study-protocol-labels.ts` (`v1_simple` /
  `v2_criteria`, route slugs `v1` / `v2`).
- **Protocol switchers**: `src/components/analysis/analysis-protocol-switcher.tsx`,
  `src/components/research/research-protocol-switcher.tsx` — filter cohorts
  without mixing frozen v1 paper data with v2 behavior.

## My study results (compare view)

- **Page**: `src/app/survey/history/page.tsx` → `StudyHistoryClient`.
- **Data / metrics**: `src/lib/study-history.ts` (grouping, SUS, Raw-TLX,
  task durations, side-by-side comparison).
- **UI components**: `src/components/survey/study-history/` (comparison
  matrix, modality filter, key insights, etc.).
- Use the canonical term **My study results** in user-facing copy (see
  `CONTEXT.md`); code paths may still use `study-history` as a folder name.

## Task assignment

- Random assignment to a task assignment set happens at survey start via
  `src/app/actions/survey.ts`.
- `src/hooks/use-survey-data.ts` filters progress and responses by
  `CURRENT_STUDY_PROTOCOL_VERSION`.

## Analysis edge function

- Dashboards call the `analysis` Supabase edge function
  (`supabase/functions/analysis`).
- Schema or aggregation changes require paired updates there and
  `make edge-functions` to re-serve locally.
- Mock seed: `supabase/seeds/z_mock_analysis_data.sql`.

## Preview environment

- Detection: `src/lib/preview-environment.ts` (`VERCEL_ENV=preview` or
  `preview.*` hostnames).
- Banner: `src/components/preview-environment-banner.tsx` (wired in
  `src/app/layout.tsx`).
- Cross-app URL helpers: `src/utils/constants.ts` (survey/login links
  rewrite to preview origin when applicable).

## UI/UX Guidelines

- **Consistency**: Match existing `home/` patterns; do not import components
  from `chat-agent/` or uni-apps without adapting to this app's substrate.
- **Research hygiene**: Changes to survey instrument wording, task ordering,
  or aggregated metrics have experimental implications — see root `AGENTS.md`
  §13.

## Database & Types

- **Type definitions**: Reference `supabase/types/database.types.ts`. Survey
  and task tables include `protocol_version` — see root `AGENTS.md` §14.
