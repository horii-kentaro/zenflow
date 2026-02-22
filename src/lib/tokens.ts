import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createVerificationToken(userId: string): Promise<string> {
  // 既存の未使用トークンを削除
  await prisma.verificationToken.deleteMany({ where: { userId } });

  const token = generateToken();
  await prisma.verificationToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間
    },
  });

  return token;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  // 既存の未使用トークンを削除
  await prisma.passwordResetToken.deleteMany({
    where: { userId, used: false },
  });

  const token = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1時間
    },
  });

  return token;
}
