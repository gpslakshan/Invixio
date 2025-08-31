import React, { Suspense } from "react";
import { Pricing } from "@/components/marketing/Pricing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/utils";
import SubmitButton from "@/components/shared/SubmitButton";
import { createCustomerPortal } from "@/app/actions/subscriptions";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { redirect } from "next/navigation";

async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId,
    },
    select: {
      status: true,
    },
  });

  return subscription;
}

const BillingPageContent = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const subscription = await getSubscription(user.id);

  if (subscription?.status === "active") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Subscription</CardTitle>
          <CardDescription>
            Click on the button below, this will give you the opportunity to
            change your payment details and view your invoices at the same time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerPortal}>
            <SubmitButton text="View Subscription Details" />
          </form>
        </CardContent>
      </Card>
    );
  }

  return <Pricing />;
};

const BillingPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BillingPageContent />
    </Suspense>
  );
};

export default BillingPage;
