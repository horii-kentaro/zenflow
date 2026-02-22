import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { validationError, internalError } from "@/lib/api-error";
import { withLogging } from "@/lib/logger";

export const POST = withLogging(async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return validationError("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return validationError("Invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return internalError("Webhook handler failed");
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = stripeSubscription as any;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan: "premium",
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      stripeStatus: stripeSubscription.status,
      startDate: new Date(subData.current_period_start * 1000),
      endDate: new Date(subData.current_period_end * 1000),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  // 請求履歴を保存
  await prisma.billingHistory.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      amount: invoice.amount_paid,
      status: invoice.status || "paid",
      invoiceUrl: invoice.hosted_invoice_url,
    },
    create: {
      subscriptionId: sub.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status || "paid",
      description: invoice.lines.data[0]?.description || "Proプラン",
      invoiceUrl: invoice.hosted_invoice_url,
    },
  });

  // サブスクリプション期間を更新
  if (invoice.lines.data[0]?.period) {
    const period = invoice.lines.data[0].period;
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan: "premium",
        startDate: new Date(period.start * 1000),
        endDate: new Date(period.end * 1000),
      },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  const isActive = ["active", "trialing"].includes(subscription.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan: isActive ? "premium" : "free",
      stripeStatus: subscription.status,
      startDate: new Date(subData.current_period_start * 1000),
      endDate: new Date(subData.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan: "free",
      stripeStatus: "canceled",
      stripeSubscriptionId: null,
      endDate: null,
    },
  });
}
