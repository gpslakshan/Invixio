import React from "react";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PaymentSuccessPage = () => {
  return (
    <div className="w-full h-full flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <CheckIcon className="p-2 size-12 rounded-full bg-green-500/30 text-green-500" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h2 className="text-xl font-semibold">Payment Successful</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight">
              Your payment has been processed successfully. Thank you for your
              purchase!
            </p>

            <Link
              href="/dashboard"
              className={`w-full mt-5 ${buttonVariants()}`}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
