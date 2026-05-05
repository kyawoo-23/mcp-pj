import { cn } from "@/lib/utils";
import { UserAvatar, AssistantAvatar, SystemIcon } from "./icons/message-icons";
import ReactMarkdown from "react-markdown";
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
import { ToolInvocation } from "./chat-tool-invocation";

interface ChatMessageProps {
  message: ChatMessageData;
  showTimestamp?: boolean;
  isStreaming?: boolean;
}

/** Compact status row while the assistant turn is streaming but has no reply text yet */
function AssistantStreamingStatus({ label }: { label: string }) {
  return (
    <div
      className='flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground'
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <Loader2
        className='h-4 w-4 shrink-0 animate-spin text-muted-foreground'
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
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
      <div className='flex w-full justify-center py-4'>
        <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground'>
          <SystemIcon />
          <span>{textContent}</span>
        </div>
      </div>
    );
  }

  // Separate text parts and tool parts
  const textParts = message.parts.filter(
    (p): p is TextPart => p.type === "text",
  );
  const toolParts = message.parts.filter(
    (p): p is ToolInvocationPart => p.type === "tool-invocation",
  );
  const textContent = textParts.map((p) => p.text).join("");

  const showThinkingStrip =
    !isUser &&
    isStreaming &&
    !textContent &&
    toolParts.length === 0;

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
      {/* Avatar */}
      <div className='shrink-0 pt-1'>
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Thinking until first streamed part (tools or text) arrives */}
        {!isUser && showThinkingStrip && (
          <AssistantStreamingStatus label={THINKING_LABEL} />
        )}

        {/* Tool Invocations (for assistant messages) */}
        {!isUser && toolParts.length > 0 && (
          <div className='w-full space-y-2'>
            {toolParts.map((part) => (
              <ToolInvocation key={part.toolCallId} part={part} />
            ))}
          </div>
        )}

        {/* Tools finished; model text not started yet */}
        {!isUser && showWritingStrip && (
          <AssistantStreamingStatus label={WRITING_LABEL} />
        )}

        {/* Text Content Bubble */}
        {textContent && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/60 text-foreground border border-border/50 rounded-tl-sm",
            )}
          >
            <div className='prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed'>
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
            {isStreaming && (
              <span className='animate-pulse inline-block h-4 w-1.5 align-middle bg-foreground/50 ml-1' />
            )}
          </div>
        )}
        {/* Optional Timestamp */}
        {showTimestamp && message.timestamp && (
          <span className='px-1 text-xs text-muted-foreground'>
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
