import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "selfcare-history");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") || "7"), 90);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateValue = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));

  const completions = await prisma.selfcareCompletion.findMany({
    where: {
      userId,
      date: { gte: startDateValue },
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      routineType: true,
      routineTitle: true,
      durationSec: true,
      date: true,
      createdAt: true,
    },
  });

  return apiSuccess(completions);
});
