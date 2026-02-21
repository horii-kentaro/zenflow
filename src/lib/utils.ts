export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return formatDate(new Date(now.setDate(diff)));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "おはようございます";
  if (hour < 18) return "こんにちは";
  return "こんばんは";
}

export function getMoodEmoji(score: number): string {
  const emojis: Record<number, string> = { 1: "😫", 2: "😟", 3: "😐", 4: "😊", 5: "😄" };
  return emojis[score] || "😐";
}

export function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const recent = values.slice(-3);
  const earlier = values.slice(0, 3);
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgEarlier = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  if (avgEarlier === 0) return 0;
  return Math.round(((avgRecent - avgEarlier) / avgEarlier) * 100);
}
