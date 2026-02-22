import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { notFoundError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const GET = withLogging(async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "export-data");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            startDate: true,
            endDate: true,
          },
        },
        moodEntries: {
          select: {
            score: true,
            note: true,
            date: true,
            createdAt: true,
          },
          orderBy: { date: "desc" },
        },
        journals: {
          select: {
            title: true,
            sentiment: true,
            sentimentScore: true,
            summary: true,
            date: true,
            createdAt: true,
            messages: {
              select: {
                role: true,
                content: true,
                createdAt: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        selfcareCompletions: {
          select: {
            routineType: true,
            routineTitle: true,
            durationSec: true,
            date: true,
            createdAt: true,
          },
          orderBy: { date: "desc" },
        },
        streakData: {
          select: {
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
          },
        },
      },
    });

    if (!user) {
      return notFoundError("ユーザーが見つかりません");
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      moodEntries: user.moodEntries,
      journals: user.journals,
      selfcareCompletions: user.selfcareCompletions,
      streakData: user.streakData,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zenflow-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch {
    return internalError("データのエクスポートに失敗しました");
  }
});
