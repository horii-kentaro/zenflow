import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDate,
  getTodayDate,
  getToday,
  getWeekStartDate,
  getWeekStart,
  cn,
  getGreeting,
  getMoodEmoji,
  calculateTrend,
} from "@/lib/utils";

describe("formatDate", () => {
  it("Date型を'YYYY-MM-DD'文字列に変換する", () => {
    const date = new Date("2026-02-22T00:00:00.000Z");
    expect(formatDate(date)).toBe("2026-02-22");
  });

  it("ISO文字列を'YYYY-MM-DD'に変換する", () => {
    expect(formatDate("2026-01-15T12:30:00.000Z")).toBe("2026-01-15");
  });

  it("UTC midnight Dateを正しくフォーマットする", () => {
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(formatDate(date)).toBe("2026-01-01");
  });
});

describe("getTodayDate", () => {
  it("UTC midnightのDate型を返す", () => {
    const today = getTodayDate();
    expect(today).toBeInstanceOf(Date);
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCSeconds()).toBe(0);
    expect(today.getUTCMilliseconds()).toBe(0);
  });

  it("今日の日付を返す", () => {
    const today = getTodayDate();
    const now = new Date();
    expect(today.getFullYear()).toBe(now.getFullYear());
    expect(today.getMonth()).toBe(now.getMonth());
    expect(today.getDate()).toBe(now.getDate());
  });
});

describe("getToday", () => {
  it("'YYYY-MM-DD'形式の文字列を返す", () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getWeekStartDate", () => {
  it("UTC midnightのDate型を返す", () => {
    const weekStart = getWeekStartDate();
    expect(weekStart).toBeInstanceOf(Date);
    expect(weekStart.getUTCHours()).toBe(0);
    expect(weekStart.getUTCMinutes()).toBe(0);
    expect(weekStart.getUTCSeconds()).toBe(0);
  });

  it("月曜日を返す", () => {
    // getUTCDay(): 0=日, 1=月, ..., 6=土
    const weekStart = getWeekStartDate();
    const day = weekStart.getUTCDay();
    expect(day).toBe(1); // Monday
  });

  it("今日以前の日付を返す", () => {
    const weekStart = getWeekStartDate();
    const today = getTodayDate();
    expect(weekStart.getTime()).toBeLessThanOrEqual(today.getTime());
  });
});

describe("getWeekStart", () => {
  it("'YYYY-MM-DD'形式の文字列を返す", () => {
    const weekStart = getWeekStart();
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("cn", () => {
  it("複数クラス名を結合する", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("falsy値を除外する", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("空の引数で空文字を返す", () => {
    expect(cn()).toBe("");
  });

  it("全てfalsyなら空文字を返す", () => {
    expect(cn(null, undefined, false)).toBe("");
  });
});

describe("getGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("午前中は'おはようございます'を返す", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 8, 0, 0));
    expect(getGreeting()).toBe("おはようございます");
  });

  it("昼は'こんにちは'を返す", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 14, 0, 0));
    expect(getGreeting()).toBe("こんにちは");
  });

  it("夜は'こんばんは'を返す", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 20, 0, 0));
    expect(getGreeting()).toBe("こんばんは");
  });

  it("12時ちょうどは'こんにちは'を返す", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 12, 0, 0));
    expect(getGreeting()).toBe("こんにちは");
  });

  it("18時ちょうどは'こんばんは'を返す", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 18, 0, 0));
    expect(getGreeting()).toBe("こんばんは");
  });
});

describe("getMoodEmoji", () => {
  it("各スコアに対応する絵文字を返す", () => {
    expect(getMoodEmoji(1)).toBe("😫");
    expect(getMoodEmoji(2)).toBe("😟");
    expect(getMoodEmoji(3)).toBe("😐");
    expect(getMoodEmoji(4)).toBe("😊");
    expect(getMoodEmoji(5)).toBe("😄");
  });

  it("不正なスコアにはデフォルト絵文字を返す", () => {
    expect(getMoodEmoji(0)).toBe("😐");
    expect(getMoodEmoji(6)).toBe("😐");
    expect(getMoodEmoji(-1)).toBe("😐");
  });
});

describe("calculateTrend", () => {
  it("値が2つ未満なら0を返す", () => {
    expect(calculateTrend([])).toBe(0);
    expect(calculateTrend([3])).toBe(0);
  });

  it("上昇傾向を正の値で返す", () => {
    const values = [2, 2, 2, 4, 4, 4];
    expect(calculateTrend(values)).toBe(100); // (4 - 2) / 2 * 100 = 100%
  });

  it("下降傾向を負の値で返す", () => {
    const values = [4, 4, 4, 2, 2, 2];
    expect(calculateTrend(values)).toBe(-50); // (2 - 4) / 4 * 100 = -50%
  });

  it("変化なしは0を返す", () => {
    const values = [3, 3, 3, 3, 3, 3];
    expect(calculateTrend(values)).toBe(0);
  });

  it("2つの値ではsliceが重複するため0を返す", () => {
    // slice(-3) = [2, 4], slice(0, 3) = [2, 4] → 同じ平均 → 0%
    const values = [2, 4];
    expect(calculateTrend(values)).toBe(0);
  });

  it("4つ以上の値で正しくトレンドを計算する", () => {
    // earlier(先頭3): [1, 2, 3] → 平均2, recent(末尾3): [4, 5, 6] → 平均5
    // (5 - 2) / 2 * 100 = 150%
    const values = [1, 2, 3, 4, 5, 6];
    expect(calculateTrend(values)).toBe(150);
  });

  it("先頭の平均が0なら0を返す", () => {
    const values = [0, 0, 0, 3, 3, 3];
    expect(calculateTrend(values)).toBe(0);
  });
});
