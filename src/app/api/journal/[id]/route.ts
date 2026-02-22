import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, notFoundError } from "@/lib/api-error";

export async function GET(
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
}

export async function DELETE(
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
}
