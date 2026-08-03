# Project Rules

## Tech Stack & Tools
- **Package Manager**: Use `pnpm` for all package management commands.
- **UI Components**: Use `shadcn/ui` for UI components.
- **Forms**: Use `react-hook-form` combined with `zod` for validation.

## UI/UX Guidelines
- **Consistency**: Ensure the UI is consistent across the entire `uni-registration` project. Follow existing patterns and styles.

## Database & Types
- **Type Definitions**: Always reference `database.types.ts` for database schema and type definitions. Ensure strict type safety matching the Supabase schema.

## Study protocol and task mode

Cross-app rules: root `AGENTS.md` §14 and `CONTEXT.md`. Local paths:

- `src/lib/study-protocol.ts` — `CURRENT_STUDY_PROTOCOL_VERSION`
- `src/lib/task-mode-client.ts`, `src/lib/task-mode-server.ts` — session/progress
- `src/lib/task-criteria.ts` — criteria matching helpers (aligned with `mcp-server`)
- `src/app/actions/registrations.ts` — criteria checks on task completion
- `src/components/tasks/task-indicator.tsx` — task UI; filters by `protocol_version`
- `src/lib/constants.ts` — `getSurveyUrl()` preview rewriting
- `src/lib/preview-environment.ts` + `src/components/preview-environment-banner.tsx`
