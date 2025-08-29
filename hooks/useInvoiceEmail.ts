import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvoice, editInvoice } from "@/app/actions/invoices";
import { InvoiceFormData } from "@/types";

interface UseInvoiceEmailProps {
  form: UseFormReturn<InvoiceFormData>;
  logoUrl: string | null;
  invoiceId?: string;
}

export const useInvoiceEmail = ({
  form,
  logoUrl,
  invoiceId,
}: UseInvoiceEmailProps) => {
  const [submittingForm, setSubmittingForm] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleSendEmail = async () => {
    // Validate form before submitting
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix form errors before sending");
      return;
    }

    setSubmittingForm(true);
    const data = form.getValues();

    try {
      // Conditionally call createInvoice or editInvoice
      let result;
      if (invoiceId) {
        result = await editInvoice(invoiceId, data, logoUrl);
      } else {
        result = await createInvoice(data, logoUrl);
      }

      if (result.status === "error") {
        toast.error(result.message);
        if (result.message.includes("monthly invoice limit")) {
          router.push("/dashboard/pricing");
          return;
        }
      } else if (result.status === "warning") {
        toast.warning(result.message, { duration: 7000 });
        setIsNavigating(true);
        router.push("/dashboard/invoices");
      } else {
        toast.success(result.message, { duration: 7000 });
        setIsNavigating(true);
        router.push("/dashboard/invoices");
      }
    } catch (error) {
      toast.error("Failed to send invoice");
      console.error(error);
    } finally {
      setSubmittingForm(false);
    }
  };

  return {
    submittingForm,
    isNavigating,
    handleSendEmail,
  };
};
