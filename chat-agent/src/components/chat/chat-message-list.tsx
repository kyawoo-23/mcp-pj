import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { WelcomeMessage } from "./welcome-message";
import type { ChatMessageData, ChatStatus } from "@/lib/types";
import { AssistantAvatar } from "./icons/message-icons";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageListProps {
  messages: ChatMessageData[];
  onPromptSelect: (prompt: string) => void;
  isLoading?: boolean;
  status: ChatStatus;
}

export function ChatMessageList({
  messages,
  onPromptSelect,
  isLoading,
  status = "ready",
}: ChatMessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <WelcomeMessage onPromptSelect={onPromptSelect} />;
  }

  const isWaitingForResponse =
    isLoading && messages[messages.length - 1]?.role === "user";

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

          {isWaitingForResponse && (
            <div className='flex w-full gap-4 py-4 px-2 md:px-4 flex-row'>
              <div className='shrink-0 pt-1'>
                <AssistantAvatar />
              </div>

              <div className='flex w-full max-w-[80%] flex-col gap-2 items-start'>
                <div className='rounded-2xl px-4 py-3 text-sm shadow-sm bg-muted/60 text-foreground border border-border/50 rounded-tl-sm w-full max-w-[320px]'>
                  <div className='flex flex-col gap-2 w-full'>
                    <Skeleton className='h-4 w-full bg-black/10 dark:bg-white/10' />
                    <Skeleton className='h-4 w-2/3 bg-black/10 dark:bg-white/10' />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} className='h-4' />
        </div>
      </ScrollArea>
    </div>
  );
}
