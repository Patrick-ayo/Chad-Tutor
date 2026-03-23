export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContext {
  languages: string[];
  jobCourses: string[];
  positions: string[];
  subjects: string[];
  skills: string[];
  goals: string[];
}

export interface ConversationState {
  userContext: UserContext;
  contextConfirmed: boolean;
  showActionOptions: boolean;
  selectedActions: ('quiz' | 'recap' | 'roadmap')[];
}
