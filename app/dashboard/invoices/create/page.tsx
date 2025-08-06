import CreateInvoiceForm from "@/components/features/invoices/CreateInvoiceForm";
import { fetchUserCurrency, getCurrentUser } from "@/lib/utils";

export default async function CreateInvoicePage() {
  const user = await getCurrentUser();
  const prefferedCurrency = await fetchUserCurrency(user?.id);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Invoice</h1>
      <p className="mb-8">
        Easily generate and send an invoice for your client.
      </p>
      {/* Additional content for the create invoice page can be added here */}
      <CreateInvoiceForm currency={prefferedCurrency} />
    </div>
  );
}
