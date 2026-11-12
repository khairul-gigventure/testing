export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  instructor?: string;
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  sessionId: string;
  isAnonymous: boolean;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  ratingOverall: number; // 1-5
  ratingContent: number; // 1-5
  ratingDelivery: number; // 1-5
  npsScore: number; // 1-10
  keyTakeaway: string; // Open Q1
  improvementSuggestion?: string; // Open Q2
  sentiment: 'Positive' | 'Neutral' | 'Constructive';
  status: 'approved' | 'hidden';
  aiFlagReason?: string;
  createdAt: string;
}

export interface ExecutiveSummary {
  strengths: string[];
  improvements: string[];
  conclusion: string;
  generatedAt: string;
  source?: string;
}

export interface AppSettings {
  adminPin: string;
  savedSummaries: Record<string, ExecutiveSummary>;
}

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
