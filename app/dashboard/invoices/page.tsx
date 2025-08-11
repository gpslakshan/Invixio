import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/utils";
import { InvoiceDataTableItem } from "@/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Suspense } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

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
      currency: true,
    },
  });

  return invoices;
}

export default function InvoicesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <p>Manage your Invoices here.</p>

      <Suspense fallback={<LoadingSpinner />}>
        <InvoiceTable />
      </Suspense>
    </div>
  );
}

async function InvoiceTable() {
  const user = await getCurrentUser();
  const invoices = await fetchInvoices(user?.id);

  return (
    <div className="mt-6">
      <DataTable columns={columns} data={invoices} />
    </div>
  );
}
