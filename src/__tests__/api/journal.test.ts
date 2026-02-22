import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    journal: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { api: { limit: 30, windowSeconds: 60 } },
}));

import { GET, POST } from "@/app/api/journal/route";
import { GET as GET_BY_ID, DELETE } from "@/app/api/journal/[id]/route";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockJournal = prisma.journal as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
};

describe("GET /api/journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ジャーナル一覧をページネーション付きで返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const journals = [
      { id: "j1", userId: "user-1", date: "2026-02-22", messages: [] },
    ];
    mockJournal.findMany.mockResolvedValue(journals);
    mockJournal.count.mockResolvedValue(1);

    const request = new Request("http://localhost:3000/api/journal");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.journals).toEqual(journals);
    expect(json.data.total).toBe(1);
    expect(json.data.hasMore).toBe(false);
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ success: false, error: { code: "UNAUTHORIZED", message: "認証が必要です" } }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/journal");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新しいジャーナルを作成する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const journal = { id: "j1", userId: "user-1", date: "2026-02-22" };
    mockJournal.create.mockResolvedValue(journal);

    const request = new Request("http://localhost:3000/api/journal", {
      method: "POST",
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(journal);
  });

  it("DB エラー時は500を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockJournal.create.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost:3000/api/journal", {
      method: "POST",
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error.message).toBe("ジャーナルの作成に失敗しました");
  });
});

describe("GET /api/journal/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定IDのジャーナルを返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const journal = { id: "j1", userId: "user-1", date: "2026-02-22", messages: [] };
    mockJournal.findFirst.mockResolvedValue(journal);

    const request = new Request("http://localhost:3000/api/journal/j1");
    const response = await GET_BY_ID(request, {
      params: Promise.resolve({ id: "j1" }),
    });
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(journal);
  });

  it("存在しないジャーナルには404を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockJournal.findFirst.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/journal/nonexistent");
    const response = await GET_BY_ID(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.message).toBe("ジャーナルが見つかりません");
  });
});

describe("DELETE /api/journal/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ジャーナルを削除する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockJournal.findFirst.mockResolvedValue({ id: "j1", userId: "user-1" });
    mockJournal.delete.mockResolvedValue({});

    const request = new Request("http://localhost:3000/api/journal/j1", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "j1" }),
    });
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(mockJournal.delete).toHaveBeenCalledWith({ where: { id: "j1" } });
  });

  it("存在しないジャーナルの削除には404を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockJournal.findFirst.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/journal/nonexistent", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });
});
