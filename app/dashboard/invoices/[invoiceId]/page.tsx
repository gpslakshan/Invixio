import EditInvoiceForm from "@/components/invoices/forms/EditInvoiceForm";
import { prisma } from "@/lib/db";
import { fetchUserCurrency, getCurrentUser } from "@/lib/utils";
import { notFound } from "next/navigation";

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
  const user = await getCurrentUser();
  const currency = await fetchUserCurrency();

  const invoice = await fetchInvoiceById(invoiceId, user?.id as string);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Invoice</h1>
      <p className="mb-8">
        Edit invoices by updating line items, quantities, pricing, and customer
        details. You can also adjust dates, discounts, and taxes.
      </p>
      <EditInvoiceForm invoice={invoice} currency={currency} />
    </div>
  );
}
