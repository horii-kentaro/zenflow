import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal-id");
  if (rateLimitResponse) return rateLimitResponse;

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "journal-id");
  if (rateLimitResponse) return rateLimitResponse;

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
