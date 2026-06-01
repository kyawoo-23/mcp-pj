const ASSISTANT_INTENT_RE = /\(intent:\s*(\{[\s\S]*\})\)\s*$/;
const HIDDEN_REF_RE = /\n*\n\(ref:\s*\{[^}]*\}\)\s*$/g;

/** Remove trailing `(intent: {...})` for display (same line or own paragraph). */
export function stripAssistantIntent(text: string): string {
  return text.replace(ASSISTANT_INTENT_RE, "").trimEnd();
}

/** Strip hidden `(ref: {...})` block from user messages for display. */
export function stripHiddenRef(text: string): string {
  return text.replace(HIDDEN_REF_RE, "").trim();
}
