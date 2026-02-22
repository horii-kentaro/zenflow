import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validationError, notFoundError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const DELETE = withLogging(async function DELETE(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "delete-account");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return validationError("パスワードを入力してください");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return notFoundError("ユーザーが見つかりません");
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return validationError("パスワードが正しくありません");
    }

    // Cascade deleteにより関連データ（Subscription, MoodEntry, Journal,
    // JournalMessage, SelfcareCompletion, StreakData, トークン）も全て削除される
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: "アカウントとすべての関連データが削除されました。",
    });
  } catch {
    return internalError("アカウントの削除に失敗しました");
  }
});
