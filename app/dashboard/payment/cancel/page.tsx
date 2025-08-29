import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import Link from "next/link";

const PaymentCancelPage = () => {
  return (
    <div className="w-full h-full flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <XIcon className="p-2 size-12 rounded-full bg-red-500/30 text-red-500" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h2 className="text-xl font-semibold">Payment Cancelled</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight">
              Your Stripe checkout was canceled. No payment has been processed.
            </p>

            <Link
              href="/dashboard"
              className={`w-full mt-5 ${buttonVariants()}`}
            >
              Go Back to Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
