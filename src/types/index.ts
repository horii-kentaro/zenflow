export type Plan = "free" | "premium";

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type MoodLabel = "bad" | "low" | "neutral" | "good" | "great";

export interface MoodOption {
  score: MoodScore;
  emoji: string;
  label: string;
  labelJa: string;
  color: string;
}

export interface MoodEntryData {
  id: string;
  score: MoodScore;
  note?: string | null;
  context?: string | null;
  date: string;
  createdAt: string;
}

export interface JournalData {
  id: string;
  title?: string | null;
  sentiment?: string | null;
  sentimentScore?: number | null;
  summary?: string | null;
  isFavorite?: boolean;
  date: string;
  createdAt: string;
  messages?: JournalMessageData[];
}

export interface JournalMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface RoutineData {
  type: string;
  title: string;
  description: string;
  durationMin: number;
  steps: string[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesUsed: number;
  freezeMonth: string | null;
}

export interface SubscriptionData {
  plan: Plan;
  startDate: string;
  endDate?: string | null;
}

export interface WeeklySummary {
  averageMood: number;
  moodTrend: number;
  totalSelfcare: number;
  journalCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  plan: Plan;
}
