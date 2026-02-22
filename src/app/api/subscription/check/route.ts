import { requireAuth } from "@/lib/auth-helpers";
import { checkFeatureAccess } from "@/lib/subscription";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, validationError } from "@/lib/api-error";

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "subscription-check");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const feature = searchParams.get("feature") as "selfcare" | "journal" | "moodHistory" | "streakFreeze" | "insights";

  if (!feature) {
    return validationError("feature パラメータが必要です");
  }

  const result = await checkFeatureAccess(userId, feature);
  return apiSuccess(result);
}
