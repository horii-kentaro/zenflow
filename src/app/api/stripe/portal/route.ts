import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, validationError, internalError } from "@/lib/api-error";
import { logger, withLogging } from "@/lib/logger";

export const POST = withLogging(async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "stripe-portal");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub?.stripeCustomerId) {
      return validationError("Stripe顧客情報が見つかりません");
    }

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    return apiSuccess({ url: session.url });
  } catch (e) {
    logger.error("Stripe portal error", { err: String(e) });
    return internalError("ポータルセッションの作成に失敗しました");
  }
});
