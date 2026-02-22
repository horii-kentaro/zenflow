import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, validationError, internalError } from "@/lib/api-error";

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "subscription");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const sub = await prisma.subscription.findUnique({
    where: { userId: userId },
  });

  return apiSuccess(sub || { plan: "free", startDate: new Date().toISOString() });
}

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "subscription");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const { plan } = await request.json();

    if (plan !== "free" && plan !== "premium") {
      return validationError("無効なプランです");
    }

    const sub = await prisma.subscription.upsert({
      where: { userId: userId },
      update: {
        plan,
        startDate: plan === "premium" ? new Date() : undefined,
        endDate: plan === "premium" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      create: {
        userId: userId,
        plan,
        startDate: new Date(),
        endDate: plan === "premium" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });

    return apiSuccess(sub);
  } catch {
    return internalError("プランの変更に失敗しました");
  }
}
