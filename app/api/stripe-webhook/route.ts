import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  // Get the raw body of the request for signature verification
  const body = await req.text();

  // Get the Stripe signature from the request headers.
  const signature = (await headers()).get("Stripe-Signature") as string;

  // Verify the signature to ensure the request is from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: unknown) {
    // On error, return a 400 Bad Request response.
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }

  // Handle the event based on its type
  switch (event.type) {
    // customer.subscription.created is triggered when a user first subscribes to a plan.
    // customer.subscription.updated is triggered for every subsequent successful payment and any change to the subscription, such as a plan change, status change, or renewal.
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const firstSubscriptionItem = subscription.items.data[0];

      // Find the user by their Stripe customer ID to link the subscription
      const user = await prisma.user.findUnique({
        where: {
          customerId: subscription.customer as string,
        },
      });

      if (!user) {
        console.error(
          `User not found for Stripe customer ID: ${subscription.customer}`
        );
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Sync the subscription data with the database. Use upsert to handle both creation and updates.
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          interval: firstSubscriptionItem.plan.interval,
          status: subscription.status,
          planId: firstSubscriptionItem.plan.id,
          currentPeriodStart: new Date(
            firstSubscriptionItem.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            firstSubscriptionItem.current_period_end * 1000
          ),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
        },
        create: {
          stripeSubscriptionId: subscription.id,
          interval: firstSubscriptionItem.plan.interval,
          status: subscription.status,
          planId: firstSubscriptionItem.plan.id,
          currentPeriodStart: new Date(
            firstSubscriptionItem.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            firstSubscriptionItem.current_period_end * 1000
          ),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
          userId: user.id,
        },
      });
      break;
    }

    // Triggered by Stripe whenever a subscription is canceled.
    // This happens when a user explicitly cancels their subscription, or it's terminated due to failed payment attempts (dunning).
    case "customer.subscription.deleted": {
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const now = new Date();

      // Update the subscription status to 'canceled' in the database
      await prisma.subscription.update({
        where: { stripeSubscriptionId: deletedSubscription.id },
        data: {
          status: "canceled",
          endedAt: now,
        },
      });
      break;
    }

    default: {
      console.warn(`Unhandled event type: ${event.type}`);
      break;
    }
  }

  // Return a 200 OK response to acknowledge receipt of the event.
  // Stripe will retry sending the event if a 200 response is not received.
  return new NextResponse("OK", { status: 200 });
}
