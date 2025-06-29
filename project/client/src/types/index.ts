export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  userId: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  code: string;
  retryAfter?: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  userId: string;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface MessageBubbleProps {
  message: Message;
}