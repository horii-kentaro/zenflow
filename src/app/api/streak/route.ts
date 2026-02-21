import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getStreakData } from "@/lib/streak";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const data = await getStreakData(userId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "ストリーク情報の取得に失敗しました" }, { status: 500 });
  }
}
