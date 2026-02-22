import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { apiSuccess, notFoundError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const POST = withLogging(async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.api, "stripe-checkout");
  if (rateLimitResponse) return rateLimitResponse;

  const { error, userId } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return notFoundError("ユーザーが見つかりません");
    }

    // 既存のStripe Customerを使うか、新規作成
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // stripeCustomerIdを保存
      await prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: {
          userId,
          plan: "free",
          stripeCustomerId: customerId,
        },
      });
    }

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: getStripePriceId(),
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pricing?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: { userId },
    });

    return apiSuccess({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return internalError("チェックアウトセッションの作成に失敗しました");
  }
});
