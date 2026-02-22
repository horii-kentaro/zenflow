import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "verify-email");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "無効または期限切れの認証リンクです。" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "メールアドレスが確認されました。",
    });
  } catch {
    return NextResponse.json(
      { error: "メールの確認に失敗しました" },
      { status: 500 }
    );
  }
}
