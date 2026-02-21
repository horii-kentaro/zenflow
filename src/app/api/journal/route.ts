import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getToday } from "@/lib/utils";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const journals = await prisma.journal.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ success: true, data: journals });
}

export async function POST() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const journal = await prisma.journal.create({
      data: {
        userId: userId,
        date: getToday(),
      },
    });

    return NextResponse.json({ success: true, data: journal });
  } catch {
    return NextResponse.json({ error: "ジャーナルの作成に失敗しました" }, { status: 500 });
  }
}
