import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { WelcomeMessage } from "./welcome-message";
import type { ChatMessageData } from "@/lib/types";

interface ChatMessageListProps {
  messages: ChatMessageData[];
  onPromptSelect: (prompt: string) => void;
}

export function ChatMessageList({
  messages,
  onPromptSelect,
}: ChatMessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return <WelcomeMessage onPromptSelect={onPromptSelect} />;
  }

  return (
    <div className='flex-1 min-h-0 w-full overflow-hidden'>
      <ScrollArea className='h-full w-full'>
        <div className='flex flex-col gap-2 p-4 pb-8 max-w-4xl mx-auto w-full'>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={bottomRef} className='h-4' />
        </div>
      </ScrollArea>
    </div>
  );
}
