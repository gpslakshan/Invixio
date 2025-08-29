"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/utils";

// Server Action to create and redirect to a Stripe Checkout Session
export async function createCheckoutSession() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  let session: Stripe.Response<Stripe.Checkout.Session>;

  try {
    const customer = await getOrCreateCustomer(user.id);

    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.customerId as string,
      billing_address_collection: "auto",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_update: { address: "auto", name: "auto" },
      success_url:
        process.env.NODE_ENV === "production"
          ? "https://www.invixio.com/dashboard/payment/success"
          : "http://localhost:3000/dashboard/payment/success",
      cancel_url:
        process.env.NODE_ENV === "production"
          ? "https://www.invixio.com/dashboard/payment/cancel"
          : "http://localhost:3000/dashboard/payment/cancel",
      subscription_data: {
        metadata: { userId: user.id },
      },
    });
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    throw error;
  }

  if (session.url) {
    return redirect(session.url);
  }
}

// This server action initiates a secure session with Stripe's Billing Portal, which allows an authenticated user to manage their subscription details.
export async function createCustomerPortal() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      user: {
        select: {
          customerId: true,
        },
      },
    },
  });

  if (!subscription || !subscription.user.customerId) {
    throw new Error("Subscription or customer ID not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.user.customerId,
    return_url:
      process.env.NODE_ENV === "production"
        ? "https://www.invixio.com/dashboard"
        : "http://localhost:3000/dashboard",
  });

  return redirect(session.url);
}

/**
 * Retrieves an existing customer from the database or creates a new one in Stripe if none exists.
 *
 * @param userId - The Id of the authenticated KindeUser.
 * @returns The database user record, including the Stripe customer ID.
 * @throws Will throw an error if the user is not found in the database, or if any database or Stripe operation fails.
 */
async function getOrCreateCustomer(userId: string) {
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        customerId: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!dbUser) {
      throw new Error(`User with ID ${userId} not found in the database.`);
    }

    if (!dbUser.customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: dbUser.email,
        name: `${dbUser.firstName ?? ""} ${dbUser.lastName ?? ""}`.trim(),
      });

      dbUser = await prisma.user.update({
        where: { id: userId },
        data: { customerId: stripeCustomer.id },
        select: {
          customerId: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Error in getOrCreateCustomer:", error);
    throw error;
  }
}
