import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { WelcomeMessage } from "./welcome-message";
import type { ChatMessageData, ChatStatus } from "@/lib/types";
import { THINKING_LABEL } from "@/lib/chat-activity";
import { AssistantAvatar } from "./icons/message-icons";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: ChatMessageData[];
  onPromptSelect: (prompt: string) => void;
  isLoading?: boolean;
  status: ChatStatus;
  /** Matches header when possible (tool-aware during streaming). */
  pendingCaption?: string;
}

export function ChatMessageList({
  messages,
  onPromptSelect,
  isLoading,
  status = "ready",
  pendingCaption,
}: ChatMessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <WelcomeMessage onPromptSelect={onPromptSelect} />;
  }

  const awaitingAssistantMessage =
    isLoading && messages[messages.length - 1]?.role === "user";

  const pendingLabel = pendingCaption ?? THINKING_LABEL;

  return (
    <div className='flex-1 min-h-0 w-full overflow-hidden'>
      <ScrollArea className='h-full w-full'>
        <div className='flex flex-col gap-2 p-4 pb-8 max-w-4xl mx-auto w-full'>
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={
                status === "streaming" && index === messages.length - 1
              }
            />
          ))}

          {awaitingAssistantMessage && (
            <div
              className='flex w-full gap-3 py-2 px-2 md:px-4 flex-row items-start'
              role='status'
              aria-live='polite'
              aria-busy='true'
              aria-label={pendingLabel}
            >
              <div className='shrink-0 pt-0.5'>
                <AssistantAvatar />
              </div>
              <div className='flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground'>
                <Loader2
                  className='h-4 w-4 shrink-0 animate-spin text-muted-foreground'
                  aria-hidden
                />
                <span>{pendingLabel}</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} className='h-4' />
        </div>
      </ScrollArea>
    </div>
  );
}
