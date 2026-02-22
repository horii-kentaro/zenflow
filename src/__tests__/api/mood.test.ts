import { describe, it, expect, vi, beforeEach } from "vitest";

// モック設定
vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    moodEntry: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { api: { limit: 30, windowSeconds: 60 } },
}));

import { GET, POST } from "@/app/api/mood/route";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockMoodEntry = prisma.moodEntry as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
};

describe("GET /api/mood", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーの気分エントリを返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const entries = [
      { id: "1", userId: "user-1", score: 4, date: "2026-02-22", note: null },
    ];
    mockMoodEntry.findMany.mockResolvedValue(entries);

    const request = new Request("http://localhost:3000/api/mood?days=7");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(entries);
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/mood");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("daysパラメータで取得期間を指定できる", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockMoodEntry.findMany.mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/mood?days=30");
    await GET(request);

    expect(mockMoodEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          date: expect.objectContaining({ gte: expect.any(Date) }),
        }),
        orderBy: { date: "asc" },
      })
    );
  });
});

describe("POST /api/mood", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効なスコアで気分を記録する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const entry = { id: "1", userId: "user-1", score: 4, date: "2026-02-22", note: null };
    mockMoodEntry.upsert.mockResolvedValue(entry);

    const request = new Request("http://localhost:3000/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 4 }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(entry);
  });

  it("ノート付きで気分を記録する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const entry = { id: "1", userId: "user-1", score: 3, date: "2026-02-22", note: "良い日" };
    mockMoodEntry.upsert.mockResolvedValue(entry);

    const request = new Request("http://localhost:3000/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 3, note: "良い日" }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.note).toBe("良い日");
  });

  it("無効なスコアでバリデーションエラーを返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });

    const request = new Request("http://localhost:3000/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 6 }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 3 }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
