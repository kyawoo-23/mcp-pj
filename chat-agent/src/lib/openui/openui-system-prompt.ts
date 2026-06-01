import { OPENUI_SYSTEM_PROMPT } from "@/generated/openui-system-prompt";

/**
 * Returns the OpenUI Lang instruction block appended to the system prompt.
 *
 * The text is generated at build/dev time from `chatOpenUILibrary` by
 * `scripts/generate-openui-prompt.mts` and committed to
 * `src/generated/openui-system-prompt.ts`. We import the generated string
 * (rather than calling `library.prompt()` at runtime) so this module — and the
 * API route that uses it — never pulls in the React renderer.
 *
 * Regenerate after changing the library or prompt options:
 *   pnpm generate:openui-prompt
 */
export function getOpenUISystemPrompt(): string {
  return OPENUI_SYSTEM_PROMPT;
}
