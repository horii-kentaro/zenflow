import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, validationError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const PATCH = withLogging(async function PATCH(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "profile");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length === 0 || name.length > 50) {
        return validationError("名前は1〜50文字で入力してください");
      }
      updateData.name = name;
    }

    if (body.notificationPrefs !== undefined) {
      updateData.notificationPrefs = body.notificationPrefs;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        notificationPrefs: true,
      },
    });

    return apiSuccess(user);
  } catch {
    return internalError("プロフィールの更新に失敗しました");
  }
});
