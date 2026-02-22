import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { api: { limit: 30, windowSeconds: 60 } },
}));

import { GET, POST } from "@/app/api/subscription/route";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockSubscription = prisma.subscription as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
};

describe("GET /api/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("サブスクリプション情報を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const sub = { userId: "user-1", plan: "premium", startDate: "2026-02-01" };
    mockSubscription.findUnique.mockResolvedValue(sub);

    const request = new Request("http://localhost:3000/api/subscription");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data).toEqual(sub);
  });

  it("サブスクリプションがない場合はfreeプランを返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockSubscription.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/subscription");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.plan).toBe("free");
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/subscription");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("プランをpremiumに変更する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    const sub = { userId: "user-1", plan: "premium" };
    mockSubscription.upsert.mockResolvedValue(sub);

    const request = new Request("http://localhost:3000/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "premium" }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.plan).toBe("premium");
  });

  it("無効なプランを拒否する", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });

    const request = new Request("http://localhost:3000/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "invalid" }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("無効なプランです");
  });
});
