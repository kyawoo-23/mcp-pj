"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ConversationRow, MessageRow } from "@/lib/types";
import { getConversationWithMessages } from "@/lib/db/conversations";

export async function createConversationAction(title?: string): Promise<{
  data: ConversationRow | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: title || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath("/");
    return { data, error: null };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create conversation",
    };
  }
}

export async function updateConversationTitleAction(
  conversationId: string,
  title: string
): Promise<{ data: null; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    if (!title) {
      return { data: null, error: "Title is required" };
    }

    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath("/");
    return { data: null, error: null };
  } catch (error) {
    console.error("Error updating conversation:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update conversation",
    };
  }
}

export async function deleteConversationAction(
  conversationId: string
): Promise<{ data: null; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath("/");
    return { data: null, error: null };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete conversation",
    };
  }
}

export async function getConversationWithMessagesAction(
  conversationId: string
): Promise<{
  data: { conversation: ConversationRow; messages: MessageRow[] } | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "Unauthorized" };
    }

    const result = await getConversationWithMessages(conversationId, user.id);
    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch conversation",
    };
  }
}

