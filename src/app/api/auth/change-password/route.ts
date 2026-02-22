import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { changePasswordSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "change-password");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "パスワードが変更されました。",
    });
  } catch {
    return NextResponse.json(
      { error: "パスワードの変更に失敗しました" },
      { status: 500 }
    );
  }
}
