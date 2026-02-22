import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getStreakData } from "@/lib/streak";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "streak");
  if (rateLimitResponse) return rateLimitResponse;
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const data = await getStreakData(userId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "ストリーク情報の取得に失敗しました" }, { status: 500 });
  }
}
