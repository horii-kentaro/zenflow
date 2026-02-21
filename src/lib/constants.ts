import { MoodOption } from "@/types";

export const MOOD_OPTIONS: MoodOption[] = [
  { score: 1, emoji: "😫", label: "bad", labelJa: "つらい", color: "var(--color-mood-bad)" },
  { score: 2, emoji: "😟", label: "low", labelJa: "低め", color: "var(--color-mood-low)" },
  { score: 3, emoji: "😐", label: "neutral", labelJa: "ふつう", color: "var(--color-mood-neutral)" },
  { score: 4, emoji: "😊", label: "good", labelJa: "良い", color: "var(--color-mood-good)" },
  { score: 5, emoji: "😄", label: "great", labelJa: "最高", color: "var(--color-mood-great)" },
];

export const FREE_LIMITS = {
  selfcarePerDay: 1,
  journalPerWeek: 3,
  moodHistoryDays: 7,
  streakFreezes: 0,
} as const;

export const PREMIUM_LIMITS = {
  selfcarePerDay: Infinity,
  journalPerWeek: Infinity,
  moodHistoryDays: Infinity,
  streakFreezes: 3,
} as const;

export const PREMIUM_PRICE = 980;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "ホーム", icon: "home" },
  { href: "/selfcare", label: "セルフケア", icon: "heart" },
  { href: "/journal", label: "ジャーナル", icon: "book" },
  { href: "/mood", label: "気分", icon: "smile" },
  { href: "/settings", label: "設定", icon: "settings" },
] as const;
