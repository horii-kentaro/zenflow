import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const sub = await prisma.subscription.findUnique({
    where: { userId: userId },
  });

  return NextResponse.json({
    success: true,
    data: sub || { plan: "free", startDate: new Date().toISOString() },
  });
}

export async function POST(request: Request) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const { plan } = await request.json();

    if (plan !== "free" && plan !== "premium") {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }

    const sub = await prisma.subscription.upsert({
      where: { userId: userId },
      update: {
        plan,
        startDate: plan === "premium" ? new Date() : undefined,
        endDate: plan === "premium" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      create: {
        userId: userId,
        plan,
        startDate: new Date(),
        endDate: plan === "premium" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });

    return NextResponse.json({ success: true, data: sub });
  } catch {
    return NextResponse.json({ error: "プランの変更に失敗しました" }, { status: 500 });
  }
}
