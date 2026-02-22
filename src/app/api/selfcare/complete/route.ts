import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { updateStreak } from "@/lib/streak";
import { getTodayDate } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, internalError } from "@/lib/api-error";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "selfcare-complete");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { routineType, routineTitle, routineData, durationSec } = body;

    const completion = await prisma.selfcareCompletion.create({
      data: {
        userId: userId,
        routineType: routineType || "breathing",
        routineTitle: routineTitle || "セルフケア",
        routineData: routineData ? JSON.stringify(routineData) : null,
        durationSec: durationSec || 0,
        date: getTodayDate(),
      },
    });

    const streak = await updateStreak(userId);

    return apiSuccess({ completion, streak });
  } catch {
    return internalError("完了の記録に失敗しました");
  }
}
