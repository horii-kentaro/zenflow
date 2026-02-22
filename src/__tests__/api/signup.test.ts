import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_password") },
}));

vi.mock("@/lib/tokens", () => ({
  createVerificationToken: vi.fn().mockResolvedValue("mock-token"),
}));

vi.mock("@/lib/mail", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(null),
  RATE_LIMITS: { auth: { limit: 5, windowSeconds: 60 } },
}));

import { POST } from "@/app/api/auth/signup/route";
import { prisma } from "@/lib/prisma";

const mockUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新規ユーザーを作成する", async () => {
    mockUser.findUnique.mockResolvedValue(null);
    mockUser.create.mockResolvedValue({ id: "user-1", name: "テスト", email: "test@example.com" });

    const request = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "テスト",
        email: "test@example.com",
        password: "Password1!",
      }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.userId).toBe("user-1");
  });

  it("既存のメールアドレスで登録を拒否する", async () => {
    mockUser.findUnique.mockResolvedValue({ id: "existing-user", email: "test@example.com" });

    const request = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "テスト",
        email: "test@example.com",
        password: "Password1!",
      }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("このメールアドレスは既に登録されています");
  });

  it("無効なデータでバリデーションエラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        email: "invalid",
        password: "weak",
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("弱いパスワードを拒否する", async () => {
    const request = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "テスト",
        email: "test@example.com",
        password: "weakpassword",
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
