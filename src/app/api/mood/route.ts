import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { moodSchema } from "@/lib/validations";
import { getToday } from "@/lib/utils";

export async function GET(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId: userId,
      date: { gte: startDateStr },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ success: true, data: entries });
}

export async function POST(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = moodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const today = getToday();
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

    return NextResponse.json({ success: true, data: entry });
  } catch {
    return NextResponse.json({ error: "気分の記録に失敗しました" }, { status: 500 });
  }
}
