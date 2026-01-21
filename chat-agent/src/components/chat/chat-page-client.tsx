"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { ClipboardCheck } from "lucide-react";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput, ChatInputHandle } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/chat/chat-header";
import { Button } from "@/components/ui/button";
import { readStoredTaskSession } from "@/lib/task-mode-client";
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
  MessageRow,
  ConversationWithCount,
} from "@/lib/types";
import {
  createConversationAction,
  getConversationWithMessagesAction,
} from "@/app/actions/conversations";
import { toast } from "sonner";

interface ChatPageClientProps {
  initialConversations: ConversationWithCount[];
  initialActiveConversationId?: string | null;
  initialMessages?: MessageRow[];
  defaultCollapsed?: boolean;
  userProfile?: { full_name: string; email: string };
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
  const [taskModeActive, setTaskModeActive] = React.useState(false);
  const taskParam = searchParams?.get("task");
  const taskPrompts: Record<string, string> = {
    register_course:
      "I want to register for a course. Please help me find a course and register.",
    drop_course: "I want to drop one of my registered courses.",
    book_room:
      "I want to book a study room. Please help me find and book one.",
    cancel_booking: "I want to cancel an existing booking.",
  };
  const taskPrompt = taskParam ? taskPrompts[taskParam] : undefined;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const {
    messages,
    sendMessage: originalSendMessage,
    status,
    setMessages,
  } = useChat({
    onFinish: () => {
      // If this was the first exchange (User + AI = 2 messages),
      // refresh to get the auto-generated title
      // We check the ref because onFinish doesn't receive updated messages in this version
      if (messagesRef.current && messagesRef.current.length === 2) {
        // Refresh to validte the new title
        router.refresh();
      }
    },
  });

  // Keep messagesRef in sync with messages
  const messagesRef = React.useRef(messages);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    const stored = readStoredTaskSession();
    if (stored?.systemType === "chat_agent") {
      setTaskModeActive(true);
    }
  }, []);

  React.useEffect(() => {
    if (taskPrompt) {
      chatInputRef.current?.setInput(taskPrompt);
      chatInputRef.current?.focus();
    }
  }, [taskPrompt]);

  const isLoading = status === "submitted" || status === "streaming";

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
    if (initialMessages.length > 0 && activeConversationId) {
      setMessages(
        initialMessages.map((m) => ({
          id: m.id,
          role: m.role as MessageRole,
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    }
  }, []); // Only run on mount

  // Update conversations when initialConversations prop changes (e.g. after router.refresh())
  React.useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Wrap sendMessage to include conversationId and handle response
  const sendMessage = React.useCallback(
    async (
      message: Parameters<typeof originalSendMessage>[0],
      options?: { conversationId?: string }
    ) => {
      // Store original fetch
      const originalFetch = globalThis.fetch;
      let responseConversationId: string | null = null;

      // Override fetch temporarily to add conversationId and capture response
      globalThis.fetch = async (
        input: RequestInfo | URL,
        init?: RequestInit
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
        await originalSendMessage(message);
        // Update conversationId if we got a new one from the response
        if (
          responseConversationId &&
          responseConversationId !== activeConversationId
        ) {
          setActiveConversationId(responseConversationId);
          // Refresh page to get updated conversations
          router.push(`/c/${responseConversationId}`);
          router.refresh();
        }
      } finally {
        // Restore original fetch
        globalThis.fetch = originalFetch;
      }
    },
    [originalSendMessage, activeConversationId, router]
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
        const { data, error } = await getConversationWithMessagesAction(
          activeConversationId
        );
        if (error || !data) {
          setMessages([]);
          return;
        }
        setMessages(
          data.messages.map((m) => ({
            id: m.id,
            role: m.role as MessageRole,
            parts: [{ type: "text" as const, text: m.content }],
          }))
        );
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setMessages([]);
      }
    };

    loadConversation();
  }, [activeConversationId, setMessages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: content }],
      },
      { conversationId: activeConversationId || undefined }
    );
  };

  const handleNewChat = async () => {
    // Check if we already have a new conversation (empty messages)
    // If so, just close the sidebar and stay on current conversation
    // Also check if ANY conversation in the history is empty
    const hasEmpty = conversations.some(
      (c) => c.messages && c.messages[0] && c.messages[0].count === 0
    );

    if (messages.length === 0 || hasEmpty) {
      setSidebarOpen(false);

      // If we are not in an empty chat but one exists, find it and switch
      if (messages.length > 0 && hasEmpty) {
        const emptyConv = conversations.find(
          (c) => c.messages && c.messages[0] && c.messages[0].count === 0
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
    (c) => c.messages && c.messages[0] && c.messages[0].count === 0
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
      {process.env.NEXT_PUBLIC_ENABLE_TASK === "true" && (
        <div className='fixed right-3 top-16 z-50 sm:right-4 sm:top-16'>
          <Link
            href={readStoredTaskSession()?.systemType === "chat_agent" ? "/tasks/session" : "/tasks"}
            aria-label='Enter task-based completion event'
            className='group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border bg-background shadow-xs px-4 py-2 text-xs sm:text-sm font-medium transition-all motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 overflow-hidden before:absolute before:left-0 before:top-0 before:z-0 before:h-full before:w-0 before:bg-primary before:transition-[width] before:duration-500 before:ease-out hover:before:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 dark:border-input'
          >
            <span className='relative z-10 flex items-center gap-2 text-foreground transition-colors duration-300 group-hover:text-primary-foreground'>
              <ClipboardCheck className='size-3.5 sm:size-4' />
              Task Mode
            </span>
          </Link>
        </div>
      )}
      {(taskModeActive && !!taskPrompt) && (
        <div className='fixed right-3 top-28 z-40 hidden w-72 rounded-xl border bg-background p-4 shadow-sm sm:block'>
          <div className='text-sm font-semibold'>Task Mode</div>
          <div className='mt-2 text-xs text-muted-foreground'>
            Use the prompt to complete the task. Progress is tracked
            automatically.
          </div>
          {taskPrompt && (
            <div className='mt-3 rounded-lg border bg-muted/50 p-2 text-xs'>
              {taskPrompt}
            </div>
          )}
          <Button
            variant='outline'
            size='sm'
            className='mt-3 w-full'
            onClick={() => router.push("/tasks/session")}
          >
            View Task Checklist
          </Button>
        </div>
      )}
      <ChatHeader
        title={activeConversation?.title || "New Chat"}
        onMobileMenuToggle={() => setSidebarOpen(true)}
        status={status}
      />

      <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
        <ChatMessageList
          messages={transformedMessages}
          onPromptSelect={(prompt) => {
            chatInputRef.current?.setInput(prompt);
            chatInputRef.current?.focus();
          }}
          isLoading={isLoading}
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
