import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getTodayDate } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
      take: limit,
      skip: offset,
    }),
    prisma.journal.count({ where: { userId: userId } }),
  ]);

  return apiSuccess({ journals, total, hasMore: offset + limit < total });
});

export const POST = withLogging(async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const journal = await prisma.journal.create({
      data: {
        userId: userId,
        date: getTodayDate(),
      },
    });

    return apiSuccess(journal);
  } catch {
    return internalError("ジャーナルの作成に失敗しました");
  }
});
