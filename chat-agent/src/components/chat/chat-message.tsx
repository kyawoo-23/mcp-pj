import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { UserAvatar, AssistantAvatar, SystemIcon } from "./icons/message-icons";

interface ChatMessageProps {
  message: Message;
  showTimestamp?: boolean;
}

export function ChatMessage({ message, showTimestamp = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";

  if (isSystem) {
    return (
      <div className="flex w-full justify-center py-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          <SystemIcon />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full gap-4 py-4 px-2 md:px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      {/* Content Bubble */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/60 text-foreground border border-border/50 rounded-tl-sm"
          )}
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>
        
        {/* Optional Timestamp */}
        {showTimestamp && (
          <span className="px-1 text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

