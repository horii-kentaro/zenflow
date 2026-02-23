import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { withLogging } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export const POST = withLogging(async function POST(request: Request) {
  const rateLimited = rateLimit(request, RATE_LIMITS.auth, "resend-verification");
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "有効なメールアドレスを入力してください" } },
      { status: 400 }
    );
  }

  // メール列挙攻撃防止: ユーザーの有無に関わらず同じレスポンスを返す
  const successResponse = NextResponse.json({
    success: true,
    data: { message: "認証メールを送信しました" },
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || user.emailVerified) {
      return successResponse;
    }

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);
  } catch {
    // エラーが発生してもレスポンスは同じ（メール列挙攻撃防止）
  }

  return successResponse;
});
