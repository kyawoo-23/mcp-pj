import type { Database, Json } from "../../../supabase/types/database.types";

// ============ Database Types ============
// Types inferred from Supabase database schema

export type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export type MessageRole = Database["public"]["Enums"]["message_role"];

// Re-export Json type for convenience
export type { Json };

// ============ Application Types ============
// UI-specific types that extend database types

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithCount extends ConversationRow {
  messages: [{ count: number }];
}

// Matches AI SDK useChat status: 'submitted' | 'streaming' | 'ready' | 'error'
export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

// ============ Chat Message Types ============

export interface TextPart {
  type: 'text';
  text: string;
}

export interface ToolInvocationPart {
  type: 'tool-invocation';
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  state:
    | 'input-streaming'
    | 'input-available'
    | 'output-available'
    | 'output-error';
  output?: unknown;
  errorText?: string;
}

export type MessagePart = TextPart | ToolInvocationPart;

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  timestamp?: Date;
}

// ============ AI SDK Message Part Types ============
// Types for transforming AI SDK messages to our ChatMessageData format

export interface AITextPart {
  type: 'text';
  text: string;
}

export interface AIToolPart {
  type: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

export type AIMessagePart = AITextPart | AIToolPart;
