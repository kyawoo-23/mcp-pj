export type MessageRole = 'user' | 'assistant' | 'system';

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

// Matches AI SDK useChat status: 'submitted' | 'streaming' | 'ready' | 'error'
export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

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
