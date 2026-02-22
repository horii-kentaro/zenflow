import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { GET } from "@/app/api/health/route";
import { prisma } from "@/lib/prisma";

const mockQueryRaw = prisma.$queryRaw as ReturnType<typeof vi.fn>;

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DB接続正常時にhealthyを返す", async () => {
    mockQueryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("healthy");
    expect(json.checks.database.status).toBe("ok");
    expect(json.timestamp).toBeDefined();
    expect(json.version).toBeDefined();
  });

  it("DB接続エラー時にdegradedを返す", async () => {
    mockQueryRaw.mockRejectedValue(new Error("Connection refused"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.checks.database.status).toBe("error");
  });
});
