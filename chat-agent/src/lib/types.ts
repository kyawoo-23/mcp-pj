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

// Profile and Task Session types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TaskSessionRow = Database["public"]["Tables"]["task_sessions"]["Row"];
export type TaskDefinitionRow = Database["public"]["Tables"]["task_definitions"]["Row"];
export type TaskProgressRow = Database["public"]["Tables"]["task_progress"]["Row"];
export type SurveyRow = Database["public"]["Tables"]["task_surveys"]["Row"];
export type SurveyQuestionRow = Database["public"]["Tables"]["task_survey_questions"]["Row"];
export type InterviewQuestionRow = Database["public"]["Tables"]["task_interview_questions"]["Row"];
export type SurveyResponseRow = Database["public"]["Tables"]["task_survey_responses"]["Row"];
export type UserInterviewResponseRow = Database["public"]["Tables"]["task_interview_responses"]["Row"];

// Enum types
export type SystemType = Database["public"]["Enums"]["system_type"];

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

export type ChatResultActionKind =
  | 'select-course'
  | 'select-section'
  | 'confirm-registration'
  | 'confirm-drop'
  | 'select-facility'
  | 'request-booking'
  | 'confirm-cancel'
  | 'send-message';

export interface ChatResultAction {
  kind: ChatResultActionKind;
  label: string;
  prompt: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
}

export type ChatResultActionHandler = (action: ChatResultAction) => void;

// Input type for creating messages
export interface CreateMessageInput {
  conversationId: string;
  role: MessageRow["role"];
  content: string;
  parts: MessagePart[];
}

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
  /** Present when `type` is `dynamic-tool` (e.g. MCP tools from `@ai-sdk/mcp`). */
  toolName?: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

export type AIMessagePart = AITextPart | AIToolPart;
