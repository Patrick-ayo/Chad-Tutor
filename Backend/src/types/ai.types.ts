export interface StudySession {
  day: number;
  title: string;
  duration: number;
  topics: string[];
  activities: string[];
}

export interface StudyPlan {
  totalDays: number;
  totalHours: number;
  sessions: StudySession[];
  keyTakeaways: string[];
  quizTopics: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizResponse {
  questions: QuizQuestion[];
}
