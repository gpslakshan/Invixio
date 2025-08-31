"use client";

import { useInvoiceStore } from "@/stores/invoice-store";
import { Crown, Loader2, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const InvoiceUsage = () => {
  const { invoiceCount, maxInvoices, isPro, isInitializing } =
    useInvoiceStore();

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Pro Plan</span>
        </div>
        <p className="text-sm text-purple-700">
          You&apos;re on the Pro plan with unlimited monthly invoices! 🎉
        </p>
      </div>
    );
  }

  const percentage = (invoiceCount / maxInvoices) * 100;
  const remaining = Math.max(0, maxInvoices - invoiceCount);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Monthly Invoices
        </span>
        <span className="text-xs text-gray-500">
          {invoiceCount}/{maxInvoices}
        </span>
      </div>

      <Progress value={percentage} className="mb-3 h-2" />

      {remaining > 0 ? (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {remaining} invoice{remaining !== 1 ? "s" : ""} remaining this month
        </p>
      ) : (
        <p className="text-xs text-amber-600 mb-3 font-medium">
          You&apos;ve reached your monthly limit
        </p>
      )}

      <Link
        href="/dashboard/billing"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-1"
      >
        <Zap className="h-3 w-3" />
        Upgrade for Unlimited
      </Link>
    </div>
  );
};

export default InvoiceUsage;
