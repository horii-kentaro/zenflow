import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function DELETE(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, "delete-account");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "パスワードを入力してください" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 400 }
      );
    }

    // Cascade deleteにより関連データ（Subscription, MoodEntry, Journal,
    // JournalMessage, SelfcareCompletion, StreakData, トークン）も全て削除される
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: "アカウントとすべての関連データが削除されました。",
    });
  } catch {
    return NextResponse.json(
      { error: "アカウントの削除に失敗しました" },
      { status: 500 }
    );
  }
}
