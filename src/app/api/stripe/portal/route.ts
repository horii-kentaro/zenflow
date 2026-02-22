import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "stripe-portal");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe顧客情報が見つかりません" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (e) {
    console.error("Stripe portal error:", e);
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
