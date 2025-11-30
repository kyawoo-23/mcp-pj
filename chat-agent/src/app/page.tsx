"use client";

import * as React from "react";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { MOCK_CONVERSATIONS } from "@/data/mock-data";
import { Message } from "@/lib/types";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] =
    React.useState<string>(MOCK_CONVERSATIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize with mock messages for the active conversation
  const activeConversation = MOCK_CONVERSATIONS.find(
    (c) => c.id === activeConversationId
  );
  const [messages, setMessages] = React.useState<Message[]>(
    activeConversation ? activeConversation.messages : []
  );

  // Update messages when conversation changes
  React.useEffect(() => {
    const conversation = MOCK_CONVERSATIONS.find(
      (c) => c.id === activeConversationId
    );
    if (conversation) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate API delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This is a simulated response. In a real app, this would come from the backend API.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewChat = () => {
    // In a real app, this would create a new conversation ID
    setActiveConversationId("new");
    setMessages([]);
    setSidebarOpen(false); // Close mobile sidebar on selection
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false); // Close mobile sidebar on selection
  };

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
        status={isLoading ? "streaming" : "connected"}
      />

      <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
        <ChatMessageList messages={messages} />

        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </ChatLayout>
  );
}
