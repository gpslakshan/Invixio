import { prisma } from "@/lib/db";
import { fetchUserCurrency, getCurrentUser } from "@/lib/utils";
import { InvoiceDataTableItem } from "@/types";
import { Suspense } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import InvoiceTable from "@/components/invoices/tables/InvoiceTable";

async function fetchInvoices(userId?: string): Promise<InvoiceDataTableItem[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      total: true,
      status: true,
      invoiceDate: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invoices;
}

export default function InvoicesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <p>Manage your Invoices here.</p>

      {/* The Suspense boundary wraps the data-fetching component */}
      <Suspense fallback={<LoadingSpinner />}>
        <InvoiceTableWrapper />
      </Suspense>
    </div>
  );
}

// This async Server Component fetches the data required for the table
async function InvoiceTableWrapper() {
  const user = await getCurrentUser();
  const invoices = await fetchInvoices(user?.id);
  const currency = await fetchUserCurrency();

  // It then renders the original InvoiceTable with the fetched data
  return (
    <div className="mt-6">
      <InvoiceTable currency={currency} invoices={invoices} />
    </div>
  );
}
