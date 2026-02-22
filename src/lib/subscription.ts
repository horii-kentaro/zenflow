import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/constants";
import { getTodayDate, getWeekStartDate } from "@/lib/utils";

type Feature = "selfcare" | "journal" | "moodHistory" | "streakFreeze" | "insights";

export async function checkFeatureAccess(
  userId: string,
  feature: Feature
): Promise<{ allowed: boolean; remaining?: number; limit?: number; message?: string }> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const plan = (sub?.plan as "free" | "premium") ?? "free";
  const limits = plan === "premium" ? PREMIUM_LIMITS : FREE_LIMITS;

  switch (feature) {
    case "selfcare": {
      const today = getTodayDate();
      const count = await prisma.selfcareCompletion.count({
        where: { userId, date: today },
      });
      const limit = limits.selfcarePerDay;
      return {
        allowed: count < limit,
        remaining: Math.max(0, limit - count),
        limit,
        message: count >= limit ? "今日のセルフケア回数の上限に達しました" : undefined,
      };
    }
    case "journal": {
      const weekStart = getWeekStartDate();
      const count = await prisma.journal.count({
        where: { userId, date: { gte: weekStart } },
      });
      const limit = limits.journalPerWeek;
      return {
        allowed: count < limit,
        remaining: Math.max(0, limit - count),
        limit,
        message: count >= limit ? "今週のジャーナル作成回数の上限に達しました" : undefined,
      };
    }
    case "moodHistory": {
      return {
        allowed: true,
        limit: limits.moodHistoryDays,
      };
    }
    case "streakFreeze": {
      return {
        allowed: plan === "premium",
        limit: limits.streakFreezes,
        message: plan !== "premium" ? "ストリークフリーズはProプランで利用できます" : undefined,
      };
    }
    case "insights": {
      return {
        allowed: plan === "premium",
        message: plan !== "premium" ? "詳細なインサイトはProプランで利用できます" : undefined,
      };
    }
    default:
      return { allowed: true };
  }
}
