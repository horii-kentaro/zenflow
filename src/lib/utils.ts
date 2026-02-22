export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/** サーバーサイド用: 今日の日付をUTC midnight Dateで返す（Prisma @db.Date用） */
export function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** クライアントサイド用: 今日の日付を"YYYY-MM-DD"文字列で返す */
export function getToday(): string {
  return formatDate(new Date());
}

/** サーバーサイド用: 今週月曜日をUTC midnight Dateで返す（Prisma @db.Date用） */
export function getWeekStartDate(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now);
  weekStart.setDate(diff);
  return new Date(Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()));
}

export function getWeekStart(): string {
  return formatDate(getWeekStartDate());
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
