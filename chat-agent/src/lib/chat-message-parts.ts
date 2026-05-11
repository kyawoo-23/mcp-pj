import { isToolUIPart, getToolName, type UIMessage } from "ai";
import type {
  MessagePart,
  MessageRole,
  MessageRow,
  TextPart,
  ToolInvocationPart,
} from "@/lib/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isTextPart(value: unknown): value is TextPart {
  return isRecord(value) && value.type === "text" && typeof value.text === "string";
}

function isPersistedToolInvocationPart(value: unknown): value is ToolInvocationPart {
  if (!isRecord(value) || value.type !== "tool-invocation") return false;
  if (typeof value.toolCallId !== "string") return false;
  if (typeof value.toolName !== "string") return false;
  if (!isRecord(value.input)) return false;
  return (
    value.state === "input-streaming" ||
    value.state === "input-available" ||
    value.state === "output-available" ||
    value.state === "output-error"
  );
}

export function normalizeStoredMessageParts(
  parts: unknown,
  fallbackContent: string,
): MessagePart[] {
  const normalized = Array.isArray(parts)
    ? parts
        .map((part): MessagePart | null => {
          if (isTextPart(part)) return { type: "text", text: part.text };
          if (isPersistedToolInvocationPart(part)) {
            return {
              type: "tool-invocation",
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              input: part.input,
              state: part.state,
              output: part.output,
              errorText: part.errorText,
            };
          }
          return null;
        })
        .filter((part): part is MessagePart => part !== null)
    : [];

  return normalized.length > 0
    ? normalized
    : [{ type: "text", text: fallbackContent }];
}

export function messageRowToUIMessage(row: MessageRow): UIMessage {
  const parts = normalizeStoredMessageParts(row.parts, row.content);
  
  const uiParts = parts.map((part) => {
    if (part.type === "tool-invocation") {
      return {
        type: `tool-${part.toolName}`,
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input: part.input,
        state: part.state,
        ...(part.output !== undefined && { output: part.output }),
        ...(part.errorText !== undefined && { errorText: part.errorText }),
      };
    }
    return part;
  });

  return {
    id: row.id,
    role: row.role as MessageRole,
    parts: uiParts as UIMessage["parts"],
  } as UIMessage;
}

export function messagePartFromUIPart(part: unknown): MessagePart | null {
  if (isTextPart(part)) {
    return { type: "text", text: part.text };
  }

  if (isPersistedToolInvocationPart(part)) {
    return {
      type: "tool-invocation",
      toolCallId: part.toolCallId,
      toolName: part.toolName,
      input: part.input,
      state: part.state,
      output: part.output,
      errorText: part.errorText,
    };
  }

  const uiPart = part as Parameters<typeof isToolUIPart>[0];
  if (isToolUIPart(uiPart)) {
    return {
      type: "tool-invocation",
      toolCallId: uiPart.toolCallId,
      toolName: getToolName(uiPart),
      input: toRecord(uiPart.input),
      state: uiPart.state as ToolInvocationPart["state"],
      output: uiPart.output,
      errorText: uiPart.errorText,
    };
  }

  return null;
}

export function stripDisplayOnlyPartsForModel(
  messages: UIMessage[],
): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: (message.parts ?? []).filter((part) => {
      if (isTextPart(part)) return true;
      return isToolUIPart(part as Parameters<typeof isToolUIPart>[0]);
    }) as UIMessage["parts"],
  }));
}
