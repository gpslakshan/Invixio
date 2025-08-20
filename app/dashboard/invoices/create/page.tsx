import { Suspense } from "react";

import CreateInvoiceForm from "@/components/invoices/forms/CreateInvoiceForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { fetchUserProfile, getCurrentUser } from "@/lib/utils";
import { UserProfile } from "@/types";

export default function CreateInvoicePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Invoice</h1>
      <p className="mb-8">
        Easily generate and send an invoice for your client.
      </p>

      {/* The Suspense boundary wraps the data-fetching component */}
      <Suspense fallback={<LoadingSpinner />}>
        <InvoiceFormWrapper />
      </Suspense>
    </div>
  );
}

// This async Server Component fetches the data required for the form
async function InvoiceFormWrapper() {
  const user = await getCurrentUser();
  const profile = await fetchUserProfile(user?.id || "");

  // It then renders the original CreateInvoiceForm with the fetched data
  return <CreateInvoiceForm profile={profile as UserProfile} />;
}
