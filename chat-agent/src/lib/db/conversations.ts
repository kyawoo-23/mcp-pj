import { createClient } from "@/lib/supabase/server";
import type { ConversationRow, MessageRow, ConversationWithCount } from "@/lib/types";

export async function getConversations(userId: string): Promise<ConversationWithCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages(count)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  // Cast the result to the correct type because Supabase types might not automatically infer the join fully
  return (data || []) as ConversationWithCount[];
}

export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ConversationRow | null> {
  const supabase = await createClient();

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return null;
  }

  return conversation;
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string
): Promise<{ conversation: ConversationRow; messages: MessageRow[] } | null> {
  const supabase = await createClient();

  // First get the conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (convError || !conversation) {
    return null;
  }

  // Then get the messages
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(`Failed to fetch messages: ${messagesError.message}`);
  }

  return {
    conversation,
    messages: messages || [],
  };
}

export async function createConversation(
  userId: string,
  title?: string
): Promise<ConversationRow> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: title || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data;
}

export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }
}

export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

