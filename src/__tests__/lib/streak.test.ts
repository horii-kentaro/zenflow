import { describe, it, expect, vi, beforeEach } from "vitest";

// Prismaモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    streakData: {
      upsert: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { updateStreak, getStreakData } from "@/lib/streak";
import { formatDate, getTodayDate } from "@/lib/utils";

const mockStreakData = prisma.streakData as unknown as {
  upsert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

describe("updateStreak", () => {
  const userId = "test-user-id";
  const today = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("新規ユーザーのストリークを作成する", async () => {
    const newStreak = {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    };
    mockStreakData.upsert.mockResolvedValue(newStreak);

    const result = await updateStreak(userId);

    expect(mockStreakData.upsert).toHaveBeenCalledWith({
      where: { userId },
      create: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
      update: {},
    });
    // lastActiveDate === today なのでそのまま返す
    expect(result).toEqual(newStreak);
  });

  it("今日すでにアクティブな場合はそのまま返す", async () => {
    const existing = {
      userId,
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: today,
    };
    mockStreakData.upsert.mockResolvedValue(existing);

    const result = await updateStreak(userId);

    expect(result).toEqual(existing);
    expect(mockStreakData.update).not.toHaveBeenCalled();
  });

  it("昨日がlastActiveDateならストリークを+1する", async () => {
    const existing = {
      userId,
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: yesterday,
    };
    mockStreakData.upsert.mockResolvedValue(existing);

    const updated = {
      ...existing,
      currentStreak: 4,
      lastActiveDate: today,
    };
    mockStreakData.update.mockResolvedValue(updated);

    const result = await updateStreak(userId);

    expect(mockStreakData.update).toHaveBeenCalledWith({
      where: { userId },
      data: {
        currentStreak: 4,
        longestStreak: 5,
        lastActiveDate: today,
      },
    });
    expect(result.currentStreak).toBe(4);
  });

  it("2日以上空いた場合はストリークを1にリセットする", async () => {
    const existing = {
      userId,
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: twoDaysAgo,
    };
    mockStreakData.upsert.mockResolvedValue(existing);

    const updated = {
      ...existing,
      currentStreak: 1,
      lastActiveDate: today,
    };
    mockStreakData.update.mockResolvedValue(updated);

    const result = await updateStreak(userId);

    expect(mockStreakData.update).toHaveBeenCalledWith({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: 10,
        lastActiveDate: today,
      },
    });
    expect(result.currentStreak).toBe(1);
  });

  it("新しいストリークがlongestStreakを超えたら更新する", async () => {
    const existing = {
      userId,
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: yesterday,
    };
    mockStreakData.upsert.mockResolvedValue(existing);

    const updated = {
      ...existing,
      currentStreak: 6,
      longestStreak: 6,
      lastActiveDate: today,
    };
    mockStreakData.update.mockResolvedValue(updated);

    await updateStreak(userId);

    expect(mockStreakData.update).toHaveBeenCalledWith({
      where: { userId },
      data: {
        currentStreak: 6,
        longestStreak: 6, // max(6, 5)
        lastActiveDate: today,
      },
    });
  });
});

describe("getStreakData", () => {
  const userId = "test-user-id";
  const today = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("データがない場合は新規作成する", async () => {
    mockStreakData.findUnique.mockResolvedValue(null);
    const created = { userId, currentStreak: 0, longestStreak: 0, lastActiveDate: null };
    mockStreakData.create.mockResolvedValue(created);

    const result = await getStreakData(userId);

    expect(mockStreakData.findUnique).toHaveBeenCalledWith({ where: { userId } });
    expect(mockStreakData.create).toHaveBeenCalledWith({ data: { userId } });
    expect(result).toEqual(created);
  });

  it("今日がlastActiveDateなら現在のデータを返す", async () => {
    const existing = {
      userId,
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: today,
    };
    mockStreakData.findUnique.mockResolvedValue(existing);

    const result = await getStreakData(userId);

    expect(result).toEqual(existing);
    expect(mockStreakData.update).not.toHaveBeenCalled();
  });

  it("昨日がlastActiveDateなら現在のデータを返す", async () => {
    const existing = {
      userId,
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: yesterday,
    };
    mockStreakData.findUnique.mockResolvedValue(existing);

    const result = await getStreakData(userId);

    expect(result).toEqual(existing);
    expect(mockStreakData.update).not.toHaveBeenCalled();
  });

  it("2日以上空いた場合はストリークを0にリセットする", async () => {
    const existing = {
      userId,
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: twoDaysAgo,
    };
    mockStreakData.findUnique.mockResolvedValue(existing);

    const resetData = { ...existing, currentStreak: 0 };
    mockStreakData.update.mockResolvedValue(resetData);

    const result = await getStreakData(userId);

    expect(mockStreakData.update).toHaveBeenCalledWith({
      where: { userId },
      data: { currentStreak: 0 },
    });
    expect(result.currentStreak).toBe(0);
  });

  it("lastActiveDateがnullでストリークが0なら更新しない", async () => {
    const existing = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };
    mockStreakData.findUnique.mockResolvedValue(existing);

    const result = await getStreakData(userId);

    expect(result).toEqual(existing);
    expect(mockStreakData.update).not.toHaveBeenCalled();
  });
});
