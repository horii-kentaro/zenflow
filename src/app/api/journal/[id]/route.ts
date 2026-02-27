import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, notFoundError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal-id");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const journal = await prisma.journal.findFirst({
    where: { id, userId: userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!journal) {
    return notFoundError("ジャーナルが見つかりません");
  }

  return apiSuccess(journal);
});

export const PATCH = withLogging(async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal-id");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const journal = await prisma.journal.findFirst({
    where: { id, userId },
  });

  if (!journal) {
    return notFoundError("ジャーナルが見つかりません");
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (typeof body.isFavorite === "boolean") {
      updateData.isFavorite = body.isFavorite;
    }
    if (typeof body.title === "string") {
      updateData.title = body.title;
    }

    const updated = await prisma.journal.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(updated);
  } catch {
    return internalError("更新に失敗しました");
  }
});

export const DELETE = withLogging(async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal-id");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const journal = await prisma.journal.findFirst({
    where: { id, userId: userId },
  });

  if (!journal) {
    return notFoundError("ジャーナルが見つかりません");
  }

  await prisma.journal.delete({ where: { id } });

  return apiSuccess(null);
});
