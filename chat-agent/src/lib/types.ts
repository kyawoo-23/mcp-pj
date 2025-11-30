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

export type ChatStatus = 'idle' | 'streaming' | 'connected' | 'thinking';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

