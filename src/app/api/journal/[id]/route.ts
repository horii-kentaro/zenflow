import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const journal = await prisma.journal.findFirst({
    where: { id, userId: userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!journal) {
    return NextResponse.json({ error: "ジャーナルが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: journal });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, userId } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const journal = await prisma.journal.findFirst({
    where: { id, userId: userId },
  });

  if (!journal) {
    return NextResponse.json({ error: "ジャーナルが見つかりません" }, { status: 404 });
  }

  await prisma.journal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
