import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/streak", () => ({
  getStreakData: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { api: { limit: 30, windowSeconds: 60 } },
}));

import { GET } from "@/app/api/streak/route";
import { requireAuth } from "@/lib/auth-helpers";
import { getStreakData } from "@/lib/streak";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockGetStreakData = getStreakData as ReturnType<typeof vi.fn>;

describe("GET /api/streak", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーのストリークデータを返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const streakData = {
      userId: "user-1",
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: "2026-02-22",
    };
    mockGetStreakData.mockResolvedValue(streakData);

    const request = new Request("http://localhost:3000/api/streak");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(streakData);
    expect(mockGetStreakData).toHaveBeenCalledWith("user-1");
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ success: false, error: { code: "UNAUTHORIZED", message: "認証が必要です" } }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/streak");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("エラー時は500を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockGetStreakData.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost:3000/api/streak");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.message).toBe("ストリーク情報の取得に失敗しました");
  });
});
