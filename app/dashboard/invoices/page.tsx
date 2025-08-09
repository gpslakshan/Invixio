import { prisma } from "@/lib/db";
import { fetchUserCurrency, getCurrentUser } from "@/lib/utils";
import { InvoiceDataTableItem } from "@/types";
import { InvoiceTable } from "../../../components/features/invoices/InvoiceTable";

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
  });

  return invoices;
}

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  const invoices = await fetchInvoices(user?.id);
  const currency = await fetchUserCurrency();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <p>Manage your Invoices here.</p>

      <div className="mt-6">
        <InvoiceTable invoices={invoices} currency={currency} />
      </div>
    </div>
  );
}
