import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "reset-password");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "無効または期限切れのリンクです。再度パスワードリセットを申請してください。" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "パスワードが正常にリセットされました。",
    });
  } catch {
    return NextResponse.json(
      { error: "パスワードのリセットに失敗しました" },
      { status: 500 }
    );
  }
}
