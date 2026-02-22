import { describe, it, expect, vi, beforeEach } from "vitest";

// Prismaモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findUnique: vi.fn() },
    selfcareCompletion: { count: vi.fn() },
    journal: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { checkFeatureAccess } from "@/lib/subscription";

const mockSubscription = prisma.subscription as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};
const mockSelfcareCompletion = prisma.selfcareCompletion as unknown as {
  count: ReturnType<typeof vi.fn>;
};
const mockJournal = prisma.journal as unknown as {
  count: ReturnType<typeof vi.fn>;
};

describe("checkFeatureAccess", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("freeプラン", () => {
    beforeEach(() => {
      mockSubscription.findUnique.mockResolvedValue(null); // free plan
    });

    describe("selfcare", () => {
      it("1日0回ならアクセスを許可する", async () => {
        mockSelfcareCompletion.count.mockResolvedValue(0);

        const result = await checkFeatureAccess(userId, "selfcare");

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);
        expect(result.limit).toBe(1);
      });

      it("1日1回で上限に達している場合は拒否する", async () => {
        mockSelfcareCompletion.count.mockResolvedValue(1);

        const result = await checkFeatureAccess(userId, "selfcare");

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.message).toBe("今日のセルフケア回数の上限に達しました");
      });
    });

    describe("journal", () => {
      it("週0回ならアクセスを許可する", async () => {
        mockJournal.count.mockResolvedValue(0);

        const result = await checkFeatureAccess(userId, "journal");

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(3);
        expect(result.limit).toBe(3);
      });

      it("週2回なら残り1回でアクセスを許可する", async () => {
        mockJournal.count.mockResolvedValue(2);

        const result = await checkFeatureAccess(userId, "journal");

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);
      });

      it("週3回で上限に達している場合は拒否する", async () => {
        mockJournal.count.mockResolvedValue(3);

        const result = await checkFeatureAccess(userId, "journal");

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(result.message).toBe("今週のジャーナル作成回数の上限に達しました");
      });
    });

    describe("moodHistory", () => {
      it("常にアクセスを許可し、7日の制限を返す", async () => {
        const result = await checkFeatureAccess(userId, "moodHistory");

        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(7);
      });
    });

    describe("streakFreeze", () => {
      it("freeプランでは拒否する", async () => {
        const result = await checkFeatureAccess(userId, "streakFreeze");

        expect(result.allowed).toBe(false);
        expect(result.limit).toBe(0);
        expect(result.message).toBe("ストリークフリーズはProプランで利用できます");
      });
    });

    describe("insights", () => {
      it("freeプランでは拒否する", async () => {
        const result = await checkFeatureAccess(userId, "insights");

        expect(result.allowed).toBe(false);
        expect(result.message).toBe("詳細なインサイトはProプランで利用できます");
      });
    });
  });

  describe("premiumプラン", () => {
    beforeEach(() => {
      mockSubscription.findUnique.mockResolvedValue({ userId, plan: "premium" });
    });

    describe("selfcare", () => {
      it("何回でもアクセスを許可する", async () => {
        mockSelfcareCompletion.count.mockResolvedValue(100);

        const result = await checkFeatureAccess(userId, "selfcare");

        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(Infinity);
      });
    });

    describe("journal", () => {
      it("何回でもアクセスを許可する", async () => {
        mockJournal.count.mockResolvedValue(100);

        const result = await checkFeatureAccess(userId, "journal");

        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(Infinity);
      });
    });

    describe("moodHistory", () => {
      it("無制限のアクセスを許可する", async () => {
        const result = await checkFeatureAccess(userId, "moodHistory");

        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(Infinity);
      });
    });

    describe("streakFreeze", () => {
      it("premiumプランでは許可する", async () => {
        const result = await checkFeatureAccess(userId, "streakFreeze");

        expect(result.allowed).toBe(true);
        expect(result.limit).toBe(3);
      });
    });

    describe("insights", () => {
      it("premiumプランでは許可する", async () => {
        const result = await checkFeatureAccess(userId, "insights");

        expect(result.allowed).toBe(true);
      });
    });
  });
});
