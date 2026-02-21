import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { checkFeatureAccess } from "@/lib/subscription";

export async function GET(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const feature = searchParams.get("feature") as "selfcare" | "journal" | "moodHistory" | "streakFreeze" | "insights";

  if (!feature) {
    return NextResponse.json({ error: "feature パラメータが必要です" }, { status: 400 });
  }

  const result = await checkFeatureAccess(userId, feature);
  return NextResponse.json({ success: true, data: result });
}
