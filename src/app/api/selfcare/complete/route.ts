import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { updateStreak } from "@/lib/streak";
import { getToday } from "@/lib/utils";

export async function POST(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { routineType, routineTitle, routineData, durationSec } = body;

    const completion = await prisma.selfcareCompletion.create({
      data: {
        userId: userId,
        routineType: routineType || "breathing",
        routineTitle: routineTitle || "セルフケア",
        routineData: routineData ? JSON.stringify(routineData) : null,
        durationSec: durationSec || 0,
        date: getToday(),
      },
    });

    const streak = await updateStreak(userId);

    return NextResponse.json({ success: true, data: { completion, streak } });
  } catch {
    return NextResponse.json({ error: "完了の記録に失敗しました" }, { status: 500 });
  }
}
