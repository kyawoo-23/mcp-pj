"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput, ChatInputHandle } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { TaskIndicator } from "@/components/tasks/task-indicator";
import { useChat } from "@ai-sdk/react";
import type {
  MessageRole,
  ChatMessageData,
  MessagePart,
  MessageRow,
  ConversationWithCount,
} from "@/lib/types";
import {
  createConversationAction,
  getConversationWithMessagesAction,
} from "@/app/actions/conversations";
import { toast } from "sonner";
import { getBusyCaptionFromChatMessages } from "@/lib/chat-activity";
import { useTaskStore } from "@/lib/store";
import {
  messagePartFromUIPart,
  messageRowToUIMessage,
} from "@/lib/chat-message-parts";

interface ChatPageClientProps {
  initialConversations: ConversationWithCount[];
  initialActiveConversationId?: string | null;
  initialMessages?: MessageRow[];
  defaultCollapsed?: boolean;
  userProfile?: { full_name: string; email: string };
}

function getInitialMessagesSignature(messages: MessageRow[]): string {
  return messages
    .map((message) => {
      const partsSize =
        typeof message.parts === "string"
          ? message.parts.length
          : JSON.stringify(message.parts ?? []).length;
      return `${message.id}:${partsSize}`;
    })
    .join("|");
}

function hasToolInvocationParts(
  messages: Array<{ parts?: unknown[] }>,
): boolean {
  return messages.some((message) =>
    message.parts?.some(
      (part) => messagePartFromUIPart(part)?.type === "tool-invocation",
    ),
  );
}

function deriveConversationTitleFromMessage(
  message:
    | {
        parts?: Array<{ type: string; text?: string }>;
      }
    | undefined,
): string | null {
  if (!message || !message.parts || message.parts.length === 0) {
    return null;
  }

  const text = message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && typeof part.text === "string",
    )
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 50)
    .trim();

  return text.length > 0 ? text : null;
}

export function ChatPageClient({
  initialConversations,
  initialActiveConversationId,
  initialMessages = [],
  defaultCollapsed = false,
  userProfile,
}: ChatPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] =
    React.useState<ConversationWithCount[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = React.useState<
    string | null
  >(initialActiveConversationId || null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = React.useState(false);
  const chatInputRef = React.useRef<ChatInputHandle>(null);
  const taskCode = searchParams?.get("task_code");
  const taskPrompts: Record<string, string> = {
    register_course:
      "I want to register for a course. Please help me find a course and register.",
    drop_course: "I want to drop one of my registered courses.",
    book_room: "I want to book a study room. Please help me find and book one.",
    cancel_booking: "I want to cancel an existing booking.",
  };
  const taskPrompt = taskCode ? taskPrompts[taskCode] : undefined;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const {
    messages,
    sendMessage: originalSendMessage,
    status,
    setMessages,
  } = useChat({
    // Keep streamed messages as the source of truth after a response.
    // A router refresh can race the server-side message persistence and replace
    // rich tool parts with stale text-only rows.
  });

  // Keep messagesRef in sync with messages
  const messagesRef = React.useRef(messages);
  const initialHydrationSignatureRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    if (taskPrompt) {
      chatInputRef.current?.setInput(taskPrompt);
      chatInputRef.current?.focus();
    }
  }, [taskPrompt]);

  const isLoading = status === "submitted" || status === "streaming";
  const requestTaskRefresh = useTaskStore((state) => state.requestTaskRefresh);
  const prevChatStatusRef = React.useRef(status);

  // Refresh task indicator after tool calls finish (realtime may not deliver on hosted Supabase).
  React.useEffect(() => {
    const prev = prevChatStatusRef.current;
    prevChatStatusRef.current = status;
    if (
      (prev === "streaming" || prev === "submitted") &&
      status === "ready"
    ) {
      requestTaskRefresh();
    }
  }, [status, requestTaskRefresh]);

  // Show toast when error status occurs
  React.useEffect(() => {
    if (status === "error") {
      toast.error("Something went wrong", {
        description: "Failed to get a response. Please try again.",
      });
    }
  }, [status]);

  // Initialize messages from initialMessages prop
  React.useEffect(() => {
    if (initialMessages.length === 0 || !activeConversationId) {
      return;
    }

    const signature = `${activeConversationId}:${getInitialMessagesSignature(
      initialMessages,
    )}`;
    if (initialHydrationSignatureRef.current === signature) {
      return;
    }

    const hydratedMessages = initialMessages.map(messageRowToUIMessage);
    const currentMessages = messagesRef.current;
    const isSameConversation =
      activeConversationId === initialActiveConversationId;
    const currentHasToolParts = hasToolInvocationParts(currentMessages);
    const incomingHasToolParts = hasToolInvocationParts(hydratedMessages);

    // Do not let a router refresh replace the just-streamed tool UI with stale
    // server props. Full page reloads still hydrate because currentMessages is empty.
    if (
      isSameConversation &&
      currentMessages.length >= hydratedMessages.length &&
      currentHasToolParts &&
      !incomingHasToolParts
    ) {
      return;
    }

    if (
      isSameConversation &&
      currentMessages.length > hydratedMessages.length
    ) {
      return;
    }

    setMessages(hydratedMessages);
    initialHydrationSignatureRef.current = signature;
  }, [
    activeConversationId,
    initialActiveConversationId,
    initialMessages,
    setMessages,
  ]);

  // Update conversations when initialConversations prop changes (e.g. after router.refresh())
  React.useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Wrap sendMessage to include conversationId and handle response
  const sendMessage = React.useCallback(
    async (
      message: Parameters<typeof originalSendMessage>[0],
      options?: { conversationId?: string },
    ) => {
      // Store original fetch
      const originalFetch = globalThis.fetch;
      let responseConversationId: string | null = null;

      // Override fetch temporarily to add conversationId and capture response
      globalThis.fetch = async (
        input: RequestInfo | URL,
        init?: RequestInit,
      ) => {
        if (
          typeof input === "string" &&
          input.includes("/api/chat") &&
          init?.body
        ) {
          try {
            const body = JSON.parse(init.body as string);
            body.conversationId =
              options?.conversationId || activeConversationId || undefined;
            init.body = JSON.stringify(body);
          } catch {
            // If parsing fails, continue with original body
          }
        }
        const response = await originalFetch(input, init);
        // Capture conversationId from response headers
        responseConversationId = response.headers.get("X-Conversation-Id");
        return response;
      };

      try {
        const derivedTitle = deriveConversationTitleFromMessage(message);

        await originalSendMessage(message);
        // Update conversationId if we got a new one from the response
        if (
          responseConversationId &&
          responseConversationId !== activeConversationId
        ) {
          setActiveConversationId(responseConversationId);
          // Avoid a full route refresh here: it can race message persistence and
          // briefly reload text-only rows and disturb in-flight streaming UI.
          window.history.replaceState(null, "", `/c/${responseConversationId}`);
        }

        const targetConversationId =
          responseConversationId ?? activeConversationId;
        if (!targetConversationId) {
          return;
        }

        setConversations((prev) => {
          const existingIndex = prev.findIndex(
            (conversation) => conversation.id === targetConversationId,
          );

          if (existingIndex === -1) {
            return [
              {
                id: targetConversationId,
                user_id: "",
                title: derivedTitle,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                messages: [{ count: 1 }] as [{ count: number }],
              },
              ...prev,
            ];
          }

          const existing = prev[existingIndex];
          const nextCount = Math.max(existing.messages?.[0]?.count ?? 0, 1);
          const shouldUpdateTitle = !existing.title && !!derivedTitle;
          const shouldUpdateCount = (existing.messages?.[0]?.count ?? 0) === 0;

          if (!shouldUpdateTitle && !shouldUpdateCount) {
            return prev;
          }

          const updated = {
            ...existing,
            title: shouldUpdateTitle ? derivedTitle : existing.title,
            updated_at: new Date().toISOString(),
            messages: [{ count: nextCount }] as [{ count: number }],
          };

          return prev.map((conversation, index) =>
            index === existingIndex ? updated : conversation,
          );
        });
      } finally {
        // Restore original fetch
        globalThis.fetch = originalFetch;
      }
    },
    [originalSendMessage, activeConversationId],
  );

  // Load messages when conversation changes
  // Skip if we already have initial messages for this conversation
  React.useEffect(() => {
    if (!activeConversationId || activeConversationId === "new") {
      setMessages([]);
      return;
    }

    // Skip fetch if we already have initial messages for this conversation
    if (
      activeConversationId === initialActiveConversationId &&
      initialMessages.length > 0
    ) {
      return;
    }

    const loadConversation = async () => {
      try {
        // Use server action to fetch conversation with messages
        const { data, error } =
          await getConversationWithMessagesAction(activeConversationId);
        if (error || !data) {
          setMessages([]);
          return;
        }
        setMessages(data.messages.map(messageRowToUIMessage));
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setMessages([]);
      }
    };

    loadConversation();
  }, [
    activeConversationId,
    initialActiveConversationId,
    initialMessages.length,
    setMessages,
  ]);

  const handleSendMessage = React.useCallback(
    async (content: string) => {
      await sendMessage(
        {
          role: "user",
          parts: [{ type: "text", text: content }],
        },
        { conversationId: activeConversationId || undefined },
      );
    },
    [sendMessage, activeConversationId],
  );

  const handleNewChat = async () => {
    // Check if we already have a new conversation (empty messages)
    // If so, just close the sidebar and stay on current conversation
    // Also check if ANY conversation in the history is empty
    const hasEmpty = conversations.some(
      (c) => c.messages && c.messages[0] && c.messages[0].count === 0,
    );

    if (messages.length === 0 || hasEmpty) {
      setSidebarOpen(false);

      // If we are not in an empty chat but one exists, find it and switch
      if (messages.length > 0 && hasEmpty) {
        const emptyConv = conversations.find(
          (c) => c.messages && c.messages[0] && c.messages[0].count === 0,
        );
        if (emptyConv) {
          router.push(`/c/${emptyConv.id}`);
        }
      }
      return;
    }

    setIsCreatingNewChat(true);
    try {
      const { data, error } = await createConversationAction();
      if (error) {
        console.error("Failed to create new conversation:", error);
        // Fallback: just set to "new" and let the API create it
        setActiveConversationId("new");
        setMessages([]);
      } else if (data) {
        router.push(`/c/${data.id}`);
      }
    } finally {
      setIsCreatingNewChat(false);
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSidebarOpen(false);
    if (activeConversationId === id) return;
    // Navigate to the conversation URL
    router.push(`/c/${id}`);
  };

  // Transform AI SDK messages to our ChatMessageData format
  const transformedMessages: ChatMessageData[] = messages.map((m) => {
    const parts: MessagePart[] = (m.parts ?? [])
      .map(messagePartFromUIPart)
      .filter((p): p is MessagePart => p !== null);

    return {
      id: m.id,
      role: m.role as MessageRole,
      parts,
      timestamp: new Date(),
    };
  });

  // Transform conversations for Sidebar component
  const sidebarConversations = conversations.map((conv) => ({
    id: conv.id,
    title: conv.title || "New Chat",
    messages: [],
    createdAt: new Date(conv.created_at),
    updatedAt: new Date(conv.updated_at),
  }));

  // Check if ANY conversation has 0 messages
  // Supabase returns count as an array of objects e.g. [{count: 0}]
  const hasEmptyConversation = conversations.some(
    (c) => c.messages && c.messages[0] && c.messages[0].count === 0,
  );

  const busyCaption = React.useMemo(
    () => getBusyCaptionFromChatMessages(messages, status),
    [messages, status],
  );

  return (
    <ChatLayout
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      sidebar={
        <Sidebar
          conversations={sidebarConversations}
          activeConversationId={activeConversationId || undefined}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          isNewChatDisabled={messages.length === 0 || hasEmptyConversation}
          isCreatingNewChat={isCreatingNewChat}
          defaultCollapsed={defaultCollapsed}
          userProfile={userProfile}
        />
      }
    >
      <TaskIndicator />
      <ChatHeader
        title={activeConversation?.title || "New Chat"}
        onMobileMenuToggle={() => setSidebarOpen(true)}
        status={status}
        busyCaption={busyCaption}
      />

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <ChatMessageList
          messages={transformedMessages}
          onPromptSelect={(prompt) => {
            chatInputRef.current?.setInput(prompt);
            chatInputRef.current?.focus();
          }}
          isLoading={isLoading}
          status={status}
          pendingCaption={busyCaption}
        />

        <ChatInput
          ref={chatInputRef}
          onSend={handleSendMessage}
          isLoading={isLoading}
          conversationId={activeConversationId}
        />
      </div>
    </ChatLayout>
  );
}
