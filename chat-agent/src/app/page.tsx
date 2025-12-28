"use client";

import * as React from "react";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { MOCK_CONVERSATIONS } from "@/data/mock-data";
import { useChat } from "@ai-sdk/react";
import type {
  MessageRole,
  ChatMessageData,
  MessagePart,
  TextPart,
  ToolInvocationPart,
  AIMessagePart,
  AITextPart,
  AIToolPart,
} from "@/lib/types";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] =
    React.useState<string>(MOCK_CONVERSATIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const activeConversation = MOCK_CONVERSATIONS.find(
    (c) => c.id === activeConversationId
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: activeConversation
      ? activeConversation.messages.map((m) => ({
          id: m.id,
          role: m.role as MessageRole,
          parts: [{ type: "text" as const, text: m.content }],
        }))
      : [],
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Update messages when conversation changes
  React.useEffect(() => {
    const conversation = MOCK_CONVERSATIONS.find(
      (c) => c.id === activeConversationId
    );
    if (conversation) {
      setMessages(
        conversation.messages.map((m) => ({
          id: m.id,
          role: m.role as MessageRole,
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    } else {
      setMessages([]);
    }
  }, [activeConversationId, setMessages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: content }],
    });
  };

  const handleNewChat = () => {
    setActiveConversationId("new");
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  // Transform AI SDK messages to our ChatMessageData format
  const transformedMessages: ChatMessageData[] = messages.map((m) => {
    const parts: MessagePart[] = (m.parts as AIMessagePart[])
      .map((p): MessagePart | null => {
        if (p.type === "text") {
          return { type: "text", text: (p as AITextPart).text } as TextPart;
        }
        // Handle tool parts - they have type like "tool-search_courses"
        if (p.type.startsWith("tool-")) {
          const toolName = p.type.replace("tool-", "");
          const toolPart = p as AIToolPart;
          return {
            type: "tool-invocation",
            toolCallId: toolPart.toolCallId,
            toolName: toolName,
            input: toolPart.input || {},
            state: toolPart.state,
            output: toolPart.output,
            errorText: toolPart.errorText,
          } as ToolInvocationPart;
        }
        return null;
      })
      .filter((p): p is MessagePart => p !== null);

    return {
      id: m.id,
      role: m.role as MessageRole,
      parts,
      timestamp: new Date(),
    };
  });

  return (
    <ChatLayout
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      sidebar={
        <Sidebar
          conversations={MOCK_CONVERSATIONS}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      }
    >
      <ChatHeader
        title={activeConversation?.title || "New Chat"}
        onMobileMenuToggle={() => setSidebarOpen(true)}
        status={status}
      />

      <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
        <ChatMessageList messages={transformedMessages} />

        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </ChatLayout>
  );
}
