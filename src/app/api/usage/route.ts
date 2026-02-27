import { requireAuth } from "@/lib/auth-helpers";
import { checkFeatureAccess } from "@/lib/subscription";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "usage");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const [selfcare, journal] = await Promise.all([
    checkFeatureAccess(userId, "selfcare"),
    checkFeatureAccess(userId, "journal"),
  ]);

  return apiSuccess({
    selfcareRemaining: selfcare.remaining ?? 0,
    journalRemaining: journal.remaining ?? 0,
  });
});
