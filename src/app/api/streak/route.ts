import { requireAuth } from "@/lib/auth-helpers";
import { getStreakData } from "@/lib/streak";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "streak");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const data = await getStreakData(userId);
    return apiSuccess(data, { cacheMaxAge: 60 });
  } catch {
    return internalError("ストリーク情報の取得に失敗しました");
  }
});
