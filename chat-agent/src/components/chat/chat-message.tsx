import * as React from "react";
import { cn } from "@/lib/utils";
import { UserAvatar, AssistantAvatar, SystemIcon } from "./icons/message-icons";
import ReactMarkdown from "react-markdown";
import { ChevronRight, Loader2, MessageSquareText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  THINKING_LABEL,
  WRITING_LABEL,
  allToolPartsFinished,
} from "@/lib/chat-activity";
import type {
  TextPart,
  ToolInvocationPart,
  ChatMessageData,
  ChatResultActionHandler,
} from "@/lib/types";
import { ToolInvocation } from "./chat-tool-invocation";

interface ChatMessageProps {
  message: ChatMessageData;
  showTimestamp?: boolean;
  isStreaming?: boolean;
  onAction?: ChatResultActionHandler;
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

function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

function AssistantNote({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="w-full overflow-hidden rounded-xl border border-border/50 bg-muted/25"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90",
          )}
          aria-hidden
        />
        {isStreaming ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <MessageSquareText className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
        <span>{isStreaming ? "Writing note..." : "Assistant note"}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border/40 px-3 py-2 text-sm text-foreground">
          <MarkdownContent text={text} />
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse align-middle bg-foreground/50" />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Strip hidden metadata block from displayed text (visible to user, not to LLM) */
function stripHiddenRef(text: string): string {
  return text.replace(/\n*\n\(ref:\s*\{[^}]*\}\)\s*$/g, "");
}

export function ChatMessage({
  message,
  showTimestamp = false,
  isStreaming = false,
  onAction,
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

  // Separate text parts and tool parts
  const textParts = message.parts.filter(
    (p): p is TextPart => p.type === "text",
  );
  const toolParts = message.parts.filter(
    (p): p is ToolInvocationPart => p.type === "tool-invocation",
  );
  const textContent = textParts.map((p) => p.text).join("");
  const displayText = isUser ? stripHiddenRef(textContent) : textContent;
  const hasToolUi = !isUser && toolParts.length > 0;

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
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2",
          isUser ? "max-w-[80%] items-end" : "w-full max-w-[80%] items-start",
        )}
      >
        {/* Thinking until first streamed part (tools or text) arrives */}
        {!isUser && showThinkingStrip && (
          <AssistantStreamingStatus label={THINKING_LABEL} />
        )}

        {/* Tool Invocations (for assistant messages) */}
        {!isUser && toolParts.length > 0 && (
          <div className="w-full space-y-2">
            {toolParts.map((part) => (
              <ToolInvocation
                key={part.toolCallId}
                part={part}
                onAction={onAction}
              />
            ))}
          </div>
        )}

        {/* Tools finished; model text not started yet */}
        {!isUser && showWritingStrip && (
          <AssistantStreamingStatus label={WRITING_LABEL} />
        )}

        {/* Text Content Bubble */}
        {textContent && hasToolUi && (
          <AssistantNote text={textContent} isStreaming={isStreaming} />
        )}

        {textContent && !hasToolUi && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/60 text-foreground border border-border/50 rounded-tl-sm",
            )}
          >
            <MarkdownContent text={displayText} />
            {isStreaming && (
              <span className="animate-pulse inline-block h-4 w-1.5 align-middle bg-foreground/50 ml-1" />
            )}
          </div>
        )}
        {/* Optional Timestamp */}
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
