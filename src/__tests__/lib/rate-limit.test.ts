import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// rate-limit.tsにはsetIntervalがあるためfake timersを使用
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("checkRateLimit", () => {
  it("最初のリクエストは許可される", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = checkRateLimit("test:1", { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("制限内のリクエストは全て許可される", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("test:2", { limit: 5, windowSeconds: 60 });
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it("制限を超えるとリクエストが拒否される", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const config = { limit: 3, windowSeconds: 60 };

    for (let i = 0; i < 3; i++) {
      checkRateLimit("test:3", config);
    }

    const result = checkRateLimit("test:3", config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("ウィンドウが過ぎるとリセットされる", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const config = { limit: 2, windowSeconds: 60 };

    checkRateLimit("test:4", config);
    checkRateLimit("test:4", config);

    // 制限超過
    expect(checkRateLimit("test:4", config).success).toBe(false);

    // 61秒後
    vi.advanceTimersByTime(61_000);

    const result = checkRateLimit("test:4", config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("異なるキーは独立してカウントされる", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const config = { limit: 1, windowSeconds: 60 };

    checkRateLimit("test:a", config);
    expect(checkRateLimit("test:a", config).success).toBe(false);

    // 別キーは許可される
    expect(checkRateLimit("test:b", config).success).toBe(true);
  });

  it("resetAtがウィンドウの終了時刻を返す", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const config = { limit: 1, windowSeconds: 60 };
    const now = Date.now();

    checkRateLimit("test:5", config);
    const result = checkRateLimit("test:5", config);

    expect(result.success).toBe(false);
    // resetAtは最初のリクエスト + windowSeconds
    expect(result.resetAt).toBeGreaterThanOrEqual(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + 60_000 + 1000);
  });
});

describe("RATE_LIMITS", () => {
  it("定義済みの設定値が正しい", async () => {
    const { RATE_LIMITS } = await import("@/lib/rate-limit");
    expect(RATE_LIMITS.auth).toEqual({ limit: 5, windowSeconds: 60 });
    expect(RATE_LIMITS.ai).toEqual({ limit: 10, windowSeconds: 60 });
    expect(RATE_LIMITS.api).toEqual({ limit: 30, windowSeconds: 60 });
  });
});
