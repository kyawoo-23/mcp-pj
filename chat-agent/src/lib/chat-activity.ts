import { getToolName, isToolUIPart } from "ai";
import { TOOL_DEFINITIONS } from "@/lib/tool-definitions";
import type { MessagePart, ToolInvocationPart } from "@/lib/types";

type MessageWithParts = {
  role: string;
  parts?: unknown[] | undefined;
};

/** Default label while waiting for the model or first streamed parts */
export const THINKING_LABEL = "Thinking…";

/** Shown after tools finish when assistant text has not started yet */
export const WRITING_LABEL = "Writing…";

/**
 * Human-readable status for an in-flight tool (input streaming / waiting to run).
 * Uses TOOL_DEFINITIONS display names when available (already written as short verb phrases).
 */
export function phraseForInFlightTool(toolName: string): string {
  const def = TOOL_DEFINITIONS[toolName];
  const base = def?.displayName ?? toolName.replace(/_/g, " ");
  return base.endsWith("…") ? base : `${base}…`;
}

/**
 * If the assistant message has a tool call that is still in progress, returns a status line
 * suitable for headers and live regions (e.g. "Searching facilities…").
 */
export function getInFlightToolActivityLabel(
  parts: unknown[] | undefined,
): string | null {
  if (!parts?.length) return null;
  let latest: string | null = null;
  for (const p of parts) {
    const uiPart = p as Parameters<typeof isToolUIPart>[0];
    if (!isToolUIPart(uiPart)) continue;
    if (
      uiPart.state === "input-streaming" ||
      uiPart.state === "input-available"
    ) {
      const toolName = getToolName(
        uiPart as Parameters<typeof getToolName>[0],
      );
      latest = phraseForInFlightTool(toolName);
    }
  }
  return latest;
}

/**
 * Tool activity for the current assistant reply (last message must be assistant).
 */
export function getAssistantActivityFromMessages(
  messages: MessageWithParts[],
): string | null {
  const last = messages[messages.length - 1];
  if (last?.role !== "assistant") return null;
  return getInFlightToolActivityLabel(last.parts);
}

/**
 * Same as {@link getInFlightToolActivityLabel} for persisted UI parts (after SDK → app transform).
 */
export function getInFlightToolActivityLabelFromParts(
  parts: MessagePart[] | undefined,
): string | null {
  if (!parts?.length) return null;
  let latest: string | null = null;
  for (const p of parts) {
    if (p.type !== "tool-invocation") continue;
    const tip = p as ToolInvocationPart;
    if (
      tip.state === "input-streaming" ||
      tip.state === "input-available"
    ) {
      latest = phraseForInFlightTool(tip.toolName);
    }
  }
  return latest;
}

export function allToolPartsFinished(parts: MessagePart[] | undefined): boolean {
  const tools = parts?.filter(
    (p): p is ToolInvocationPart => p.type === "tool-invocation",
  );
  if (!tools?.length) return false;
  return tools.every(
    (t) => t.state === "output-available" || t.state === "output-error",
  );
}

/**
 * After all tools have finished, before any assistant text has streamed.
 */
export function getWritingPhaseLabelFromMessages(
  messages: MessageWithParts[],
): string | null {
  const last = messages[messages.length - 1];
  if (last?.role !== "assistant" || !last.parts?.length) return null;

  let textAccum = "";
  let sawTool = false;
  let anyToolInFlight = false;

  for (const p of last.parts) {
    if (
      typeof p === "object" &&
      p !== null &&
      "type" in p &&
      (p as { type: string }).type === "text"
    ) {
      textAccum += (p as { text?: string }).text ?? "";
    }
    const uiPart = p as Parameters<typeof isToolUIPart>[0];
    if (isToolUIPart(uiPart)) {
      sawTool = true;
      if (
        uiPart.state === "input-streaming" ||
        uiPart.state === "input-available"
      ) {
        anyToolInFlight = true;
      }
    }
  }

  if (textAccum.trim().length > 0 || !sawTool || anyToolInFlight) return null;
  return WRITING_LABEL;
}

/**
 * Header / live-region caption while a reply is in flight (matches message-level activity).
 */
export function getBusyCaptionFromChatMessages(
  messages: MessageWithParts[],
  status: "submitted" | "streaming" | "ready" | "error",
): string | undefined {
  if (status !== "submitted" && status !== "streaming") return undefined;
  const toolLabel = getAssistantActivityFromMessages(messages);
  if (toolLabel) return toolLabel;
  const writing = getWritingPhaseLabelFromMessages(messages);
  if (writing) return writing;
  return THINKING_LABEL;
}
