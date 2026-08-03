import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { UserAvatar, AssistantAvatar, SystemIcon } from "./icons/message-icons";
import { Loader2 } from "lucide-react";
import {
  THINKING_LABEL,
  WRITING_LABEL,
  allToolPartsFinished,
} from "@/lib/chat-activity";
import type {
  TextPart,
  ToolInvocationPart,
  ChatMessageData,
} from "@/lib/types";
import { stripAssistantIntent, stripHiddenRef } from "@/lib/assistant-intent";
import { OPENUI_RENDERING_ENABLED } from "@/lib/openui/openui-config";
import { MarkdownContent } from "./markdown-content";

/** Lazy-load OpenUI (~heavy); only registered when the feature flag is on. */
const OpenUIAwareContent = OPENUI_RENDERING_ENABLED
  ? dynamic(
      () =>
        import("./openui-aware-content").then((m) => m.OpenUIAwareContent),
      {
        ssr: false,
        loading: () => (
          <div
            className="h-8 animate-pulse rounded-lg bg-muted/40"
            aria-hidden
          />
        ),
      },
    )
  : null;

interface ChatMessageProps {
  message: ChatMessageData;
  showTimestamp?: boolean;
  isStreaming?: boolean;
}

/** Compact status row while the assistant turn is streaming but has no reply text yet */
function AssistantStreamingStatus({ label }: { label: string }) {
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

/** Collapse near-duplicate paragraphs (model often repeats the same confirmation). */
function dedupeAssistantParagraphs(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length < 2) return text;

  const normalize = (p: string) =>
    p
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();

  const kept: string[] = [];
  for (const p of paragraphs) {
    const key = normalize(p);
    if (kept.some((existing) => normalize(existing) === key)) continue;
    if (
      kept.some(
        (existing) =>
          key.length > 40 &&
          (key.includes(normalize(existing)) || normalize(existing).includes(key)),
      )
    ) {
      continue;
    }
    kept.push(p);
  }
  return kept.join("\n\n");
}

export function ChatMessage({
  message,
  showTimestamp = false,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    const textContent = message.parts
      .filter((p): p is TextPart => p.type === "text")
      .map((p) => p.text)
      .join("");

    return (
      <div className="flex w-full justify-center py-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          <SystemIcon />
          <span>{textContent}</span>
        </div>
      </div>
    );
  }

  const textParts = message.parts.filter(
    (p): p is TextPart => p.type === "text",
  );
  const toolParts = message.parts.filter(
    (p): p is ToolInvocationPart => p.type === "tool-invocation",
  );
  const textContent = textParts.map((p) => p.text).join("");
  const displayText = isUser
    ? stripHiddenRef(textContent)
    : dedupeAssistantParagraphs(stripAssistantIntent(textContent));

  const showThinkingStrip =
    !isUser && isStreaming && !textContent && toolParts.length === 0;

  const showWritingStrip =
    !isUser &&
    isStreaming &&
    !textContent &&
    toolParts.length > 0 &&
    allToolPartsFinished(message.parts);

  return (
    <div
      className={cn(
        "flex w-full gap-4 py-4 px-2 md:px-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div className="shrink-0 pt-1">
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      <div
        className={cn(
          "flex flex-col gap-2",
          isUser ? "max-w-[80%] items-end" : "w-full max-w-[80%] items-start",
        )}
      >
        {!isUser && showThinkingStrip && (
          <AssistantStreamingStatus label={THINKING_LABEL} />
        )}

        {!isUser && showWritingStrip && (
          <AssistantStreamingStatus label={WRITING_LABEL} />
        )}

        {textContent && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/60 text-foreground border border-border/50 rounded-tl-sm",
            )}
          >
            {!isUser && OpenUIAwareContent ? (
              <OpenUIAwareContent
                text={displayText}
                isStreaming={isStreaming}
              />
            ) : (
              <MarkdownContent text={displayText} />
            )}
            {isStreaming && (
              <span className="animate-pulse inline-block h-4 w-1.5 align-middle bg-foreground/50 ml-1" />
            )}
          </div>
        )}

        {showTimestamp && message.timestamp && (
          <span className="px-1 text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
