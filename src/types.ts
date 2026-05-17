export type MessageRole = 'user' | 'model';

export interface ChatMessage {
  role: MessageRole;
  parts: { text: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}
