export interface Source {
  title: string;
  article_number: string | number;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  created: number;
  messages: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  session_id: string;
}