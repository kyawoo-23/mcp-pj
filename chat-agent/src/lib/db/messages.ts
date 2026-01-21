import { createClient } from "@/lib/supabase/server";
import type { MessageRow, Json, CreateMessageInput } from "@/lib/types";

export async function getMessages(
  conversationId: string,
  userId: string
): Promise<MessageRow[]> {
  const supabase = await createClient();

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

export async function createMessage(
  input: CreateMessageInput
): Promise<MessageRow> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      parts: input.parts as unknown as Json,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create message: ${error.message}`);
  }

  return data;
}

