import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

export async function requireAuth(): Promise<{ error: NextResponse; userId: string } | { error: null; userId: string }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: "" };
  }
  return { error: null, userId: user.id };
}

export async function getUserWithSubscription(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
}

export async function getUserPlan(userId: string): Promise<"free" | "premium"> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  return (sub?.plan as "free" | "premium") ?? "free";
}
