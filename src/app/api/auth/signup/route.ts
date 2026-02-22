import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validations";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { apiSuccess, validationError, conflictError, internalError } from "@/lib/api-error";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "signup");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflictError("このメールアドレスは既に登録されています");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        subscription: {
          create: { plan: "free" },
        },
        streakData: {
          create: {},
        },
      },
    });

    // メール認証トークンを送信
    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(email, token);

    return apiSuccess({ userId: user.id });
  } catch {
    return internalError("アカウントの作成に失敗しました");
  }
}
