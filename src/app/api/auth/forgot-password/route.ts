import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, validationError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const POST = withLogging(async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "forgot-password");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // ユーザーが存在しなくても同じレスポンスを返す（情報漏洩防止）
    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    }

    return apiSuccess({ message: "パスワードリセットのメールを送信しました。メールをご確認ください。" });
  } catch {
    return internalError("パスワードリセットメールの送信に失敗しました");
  }
});
