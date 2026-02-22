import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { moodSchema } from "@/lib/validations";
import { getTodayDate } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validationError, internalError, apiSuccess } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "mood");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateValue = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId: userId,
      date: { gte: startDateValue },
    },
    orderBy: { date: "asc" },
  });

  return apiSuccess(entries);
});

export const POST = withLogging(async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "mood");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = moodSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    const today = getTodayDate();
    const entry = await prisma.moodEntry.upsert({
      where: {
        userId_date: { userId: userId, date: today },
      },
      update: {
        score: parsed.data.score,
        note: parsed.data.note || null,
      },
      create: {
        userId: userId,
        score: parsed.data.score,
        note: parsed.data.note || null,
        date: today,
      },
    });

    return apiSuccess(entry);
  } catch {
    return internalError("気分の記録に失敗しました");
  }
});
