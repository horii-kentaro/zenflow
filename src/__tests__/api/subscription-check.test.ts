import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-helpers", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/subscription", () => ({
  checkFeatureAccess: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { api: { limit: 30, windowSeconds: 60 } },
}));

import { GET } from "@/app/api/subscription/check/route";
import { requireAuth } from "@/lib/auth-helpers";
import { checkFeatureAccess } from "@/lib/subscription";

const mockRequireAuth = requireAuth as ReturnType<typeof vi.fn>;
const mockCheckFeatureAccess = checkFeatureAccess as ReturnType<typeof vi.fn>;

describe("GET /api/subscription/check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("feature パラメータなしで400を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });

    const request = new Request("http://localhost:3000/api/subscription/check");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("feature パラメータが必要です");
  });

  it("selfcareの利用可能状態を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockCheckFeatureAccess.mockResolvedValue({ allowed: true, remaining: 1, limit: 1 });

    const request = new Request("http://localhost:3000/api/subscription/check?feature=selfcare");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.allowed).toBe(true);
    expect(mockCheckFeatureAccess).toHaveBeenCalledWith("user-1", "selfcare");
  });

  it("journalの利用制限状態を返す", async () => {
    mockRequireAuth.mockResolvedValue({ error: null, userId: "user-1" });
    mockCheckFeatureAccess.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 3,
      message: "今週のジャーナル作成回数の上限に達しました",
    });

    const request = new Request("http://localhost:3000/api/subscription/check?feature=journal");
    const response = await GET(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.allowed).toBe(false);
    expect(json.data.message).toBe("今週のジャーナル作成回数の上限に達しました");
  });

  it("未認証ユーザーには401を返す", async () => {
    mockRequireAuth.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
      userId: "",
    });

    const request = new Request("http://localhost:3000/api/subscription/check?feature=selfcare");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
