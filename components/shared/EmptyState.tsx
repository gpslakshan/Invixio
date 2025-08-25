import { FileText } from "lucide-react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
      <div className="rounded-full bg-gray-100 p-6 mb-6 shadow-sm">
        <FileText className="w-12 h-12 text-gray-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">No Invoices Yet</h2>
      <p className="text-gray-600 max-w-md mb-6">
        You haven&apos;t created any invoices yet. Start by creating your first
        one to keep track of your invoices and revenue.
      </p>
      <Link
        href="/dashboard/invoices/create"
        className={buttonVariants({ size: "lg" })}
      >
        Create Your First Invoice
      </Link>
    </div>
  );
};

export default EmptyState;
