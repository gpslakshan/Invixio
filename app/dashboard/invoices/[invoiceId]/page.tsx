import { Suspense } from "react";
import { notFound } from "next/navigation";

import EditInvoiceForm from "@/components/invoices/forms/EditInvoiceForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { prisma } from "@/lib/db";
import { fetchUserProfile, getCurrentUser } from "@/lib/utils";
import { UserProfile } from "@/types";

async function fetchInvoiceById(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId },
    include: { items: true },
  });

  if (!invoice) {
    return notFound();
  }

  return invoice;
}

type Params = Promise<{ invoiceId: string }>;

export default async function EditInvoicePage({ params }: { params: Params }) {
  const { invoiceId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Invoice</h1>
      <p className="mb-8">
        Edit invoices by updating line items, quantities, pricing, and customer
        details. You can also adjust dates, discounts, and taxes.
      </p>

      {/* The Suspense boundary wraps the data-fetching component */}
      <Suspense fallback={<LoadingSpinner />}>
        <InvoiceFormWrapper invoiceId={invoiceId} />
      </Suspense>
    </div>
  );
}

// This async Server Component fetches the data required for the form
async function InvoiceFormWrapper({ invoiceId }: { invoiceId: string }) {
  const user = await getCurrentUser();
  const profile = await fetchUserProfile(user?.id as string);
  const invoice = await fetchInvoiceById(invoiceId, user?.id as string);

  // It then renders the original EditInvoiceForm with the fetched data
  return <EditInvoiceForm invoice={invoice} profile={profile as UserProfile} />;
}
