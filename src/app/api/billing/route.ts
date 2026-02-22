import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

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
      return NextResponse.json({ success: true, data: [] });
    }

    const history = await prisma.billingHistory.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: history });
  } catch {
    return NextResponse.json(
      { error: "請求履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
