import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/utils";
import { InvoiceData, InvoiceFormData } from "@/types";

interface UseInvoicePDFProps {
  form: UseFormReturn<InvoiceFormData>;
  subtotal: number;
  total: number;
  logoUrl: string | null;
}

export const useInvoicePDF = ({
  form,
  subtotal,
  total,
  logoUrl,
}: UseInvoicePDFProps) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createInvoiceData = (
    data: InvoiceFormData,
    isDraft: boolean = false
  ): InvoiceData => ({
    id: `INV${Date.now().toString()}`,
    status: "DRAFT",
    invoiceNumber: data.invoiceNumber || (isDraft ? "INV-DRAFT" : ""),
    companyName: data.companyName || (isDraft ? "Your Company" : ""),
    companyEmail:
      data.companyEmail || (isDraft ? "your-email@company.com" : ""),
    companyAddress:
      data.companyAddress || (isDraft ? "Your Company Address" : ""),
    clientName: data.clientName || (isDraft ? "Client Name" : ""),
    clientEmail: data.clientEmail || (isDraft ? "client@email.com" : ""),
    clientAddress: data.clientAddress || (isDraft ? "Client Address" : ""),
    invoiceDate: data.invoiceDate || new Date(),
    dueDate: data.dueDate || new Date(),
    subtotal,
    tax: data.tax || 0,
    discount: data.discount || 0,
    total,
    notes: data.notes || (isDraft ? "" : ""),
    logoUrl: logoUrl,
    items:
      data.items?.length > 0
        ? data.items.map((item) => ({
            description: item.description || (isDraft ? "Sample Item" : ""),
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: (item.quantity || 1) * (item.rate || 0),
          }))
        : isDraft
          ? [
              {
                description: "Sample Item - Add items above",
                quantity: 1,
                rate: 0,
                amount: 0,
              },
            ]
          : [],
    paymentInstructions:
      data.paymentInstructions ||
      (isDraft ? "Payment instructions will appear here" : ""),
  });

  const handlePreview = async () => {
    const data = form.getValues();
    setGeneratingPreview(true);
    try {
      const invoiceData = createInvoiceData(data, true);
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create a Blob from the ArrayBuffer buffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      toast.error("Failed to generate invoice preview");
      console.error(error);
    } finally {
      setGeneratingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDownloadPDF = async () => {
    // Validate form before submitting
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix form errors before downloading");
      return;
    }

    const data = form.getValues();
    setDownloadingPDF(true);
    try {
      const invoiceData = createInvoiceData(data);
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      const filename = "invoice.pdf";

      // Create a Blob from the ArrayBuffer buffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });

      // Create an object URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      // Append the link to the document and trigger a click
      document.body.appendChild(a);
      a.click();

      // Remove the link and revoke the URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download invoice PDF");
      console.error(error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  return {
    downloadingPDF,
    generatingPreview,
    previewOpen,
    previewUrl,
    handlePreview,
    closePreview,
    handleDownloadPDF,
  };
};
