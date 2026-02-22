import { prisma } from "@/lib/prisma";
import { requireAuth, getUserPlan } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "mood-insights");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const plan = await getUserPlan(userId);

  const entries = await prisma.moodEntry.findMany({
    where: { userId: userId },
    orderBy: { date: "desc" },
    take: plan === "premium" ? 90 : 7,
  });

  if (entries.length < 3) {
    return apiSuccess({
      insight: "データを蓄積中です。毎日の気分を記録すると、AIがパターンを分析します。",
      premium: plan === "premium",
    });
  }

  const avgScore = entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
  const recentAvg = entries.slice(0, 3).reduce((sum, e) => sum + e.score, 0) / 3;

  let insight = "";
  if (recentAvg > avgScore + 0.5) {
    insight = "最近の気分は上向き傾向です。今の良い習慣を続けていきましょう。";
  } else if (recentAvg < avgScore - 0.5) {
    insight = "最近少し気分が下がり気味のようです。セルフケアの時間を意識的に作ってみましょう。";
  } else {
    insight = "気分は安定しています。日々のセルフケアが良い効果を生んでいるようです。";
  }

  return apiSuccess({ insight, averageScore: avgScore, recentAverage: recentAvg, premium: plan === "premium" });
});
