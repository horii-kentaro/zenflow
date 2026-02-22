import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, internalError } from "@/lib/api-error";

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "billing");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      return apiSuccess([]);
    }

    const history = await prisma.billingHistory.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return apiSuccess(history);
  } catch {
    return internalError("請求履歴の取得に失敗しました");
  }
}
