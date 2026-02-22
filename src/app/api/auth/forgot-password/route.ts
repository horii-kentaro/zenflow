import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "forgot-password");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // ユーザーが存在しなくても同じレスポンスを返す（情報漏洩防止）
    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      success: true,
      message: "パスワードリセットのメールを送信しました。メールをご確認ください。",
    });
  } catch {
    return NextResponse.json(
      { error: "パスワードリセットメールの送信に失敗しました" },
      { status: 500 }
    );
  }
}
