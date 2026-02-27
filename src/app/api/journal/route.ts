import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getTodayDate } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("search") || "";
  const sentiment = searchParams.get("sentiment") || "";
  const favorite = searchParams.get("favorite") === "true";

  const where: Prisma.JournalWhereInput = { userId };

  if (sentiment) {
    where.sentiment = sentiment;
  }

  if (favorite) {
    where.isFavorite = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { messages: { some: { content: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where,
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
    prisma.journal.count({ where }),
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
