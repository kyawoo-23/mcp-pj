import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getConversations,
  getConversationWithMessages,
} from "@/lib/db/conversations";
import { ChatPageClient } from "@/components/chat/chat-page-client";
import type { MessageRow } from "@/lib/types";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get("sidebar:state")?.value === "true";
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch conversations server-side for the sidebar
  const conversations = await getConversations(user.id);

  let initialMessages: MessageRow[] = [];
  let activeConversationId: string | null = id;

  if (id === "new") {
    activeConversationId = null; // Client treats null as new chat
  } else {
    // Validate that the conversation belongs to the user and exists
    // The sidebar list already has the user's conversations, we can check there first to avoid a DB call
    // BUT, the sidebar list might not contain ALL conversations if we paginate later. 
    // For now, let's query the specific conversation safely.
    
    // Check if the ID looks like a UUID to avoid DB errors
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (!isUuid) {
        // If it's not 'new' and not a UUID, it's invalid
        notFound();
    }

    const result = await getConversationWithMessages(id, user.id);
    
    if (!result) {
      // Conversation not found or doesn't belong to user
      // Redirect to new chat or 404? 
      // Let's redirect to /c/new for better UX if a stale link is clicked
      redirect("/c/new");
    }

    if (result) {
      initialMessages = result.messages;
    }
  }

  return (
    <ChatPageClient
      initialConversations={conversations}
      initialActiveConversationId={activeConversationId}
      initialMessages={initialMessages}
      defaultCollapsed={defaultCollapsed}
    />
  );
}
