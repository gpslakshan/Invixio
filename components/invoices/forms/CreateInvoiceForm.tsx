"use client";

import React from "react";
import { Form } from "@/components/ui/form";
import InvoiceFormActions from "./InvoiceFormActions";
import InvoicePreview from "./InvoicePreview";

import { useInvoiceEmail } from "@/hooks/useInvoiceEmail";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useInvoiceLogo } from "@/hooks/useInvoiceLogo";
import { useInvoicePDF } from "@/hooks/useInvoicePDF";
import { useSticky } from "@/hooks/useSticky";

import AdditionalNotes from "./sections/AdditionalNotes";
import ClientDetails from "./sections/ClientDetails";
import InvoiceDetails from "./sections/InvoiceDetails";
import InvoiceItems from "./sections/InvoiceItems";
import InvoiceSummary from "./sections/InvoiceSummary";
import IssuerDetails from "./sections/IssuerDetails";
import LogoUploader from "./sections/LogoUploader";
import PaymentInstructions from "./sections/PaymentInstructions";

interface Props {
  currency: string;
}

const CreateInvoiceForm = ({ currency }: Props) => {
  const {
    form,
    fields,
    watchedItems,
    subtotal,
    total,
    handleAddItem,
    handleRemoveItem,
  } = useInvoiceForm();

  const {
    logoPreview,
    logoUrl,
    uploadingLogo,
    deletingLogo,
    handleLogoChange,
    removeLogo,
  } = useInvoiceLogo();

  const {
    downloadingPDF,
    generatingPreview,
    previewOpen,
    previewUrl,
    handlePreview,
    closePreview,
    handleDownloadPDF,
  } = useInvoicePDF({ form, subtotal, total, logoUrl });

  const { submittingForm, isNavigating, handleSendEmail } = useInvoiceEmail({
    form,
    logoUrl,
  });

  const sticky = useSticky(100);

  return (
    <div className="max-w-4xl mx-auto">
      <InvoiceFormActions
        isUploadingLogo={uploadingLogo}
        isDeletingLogo={deletingLogo}
        isSubmittingForm={submittingForm || isNavigating}
        isDownloadingPDF={downloadingPDF}
        isGeneratingPreview={generatingPreview}
        onPreview={handlePreview}
        onDownloadPDF={handleDownloadPDF}
        onSendEmail={handleSendEmail}
        isSticky={sticky}
      />

      <div className="p-6 space-y-6 border bg-white shadow">
        <Form {...form}>
          <form className="space-y-6">
            {/* Top Section: Issuer Details and Logo */}
            <div className="flex flex-col md:flex-row justify-between items-stretch flex-grow gap-6">
              <IssuerDetails form={form} />
              <LogoUploader
                logoPreview={logoPreview}
                uploadingLogo={uploadingLogo}
                deletingLogo={deletingLogo}
                handleLogoChange={handleLogoChange}
                removeLogo={removeLogo}
              />
            </div>

            {/* Middle Section: Client Details and Invoice Details */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
              <ClientDetails form={form} />
              <InvoiceDetails form={form} />
            </div>

            {/* Invoice Items */}
            <InvoiceItems
              form={form}
              fields={fields}
              watchedItems={watchedItems}
              currency={currency}
              handleAddItem={handleAddItem}
              handleRemoveItem={handleRemoveItem}
            />

            {/* Summary Section */}
            <InvoiceSummary
              form={form}
              subtotal={subtotal}
              total={total}
              currency={currency}
            />

            {/* Payment Instructions */}
            <PaymentInstructions form={form} />

            {/* Additional Notes */}
            <AdditionalNotes form={form} />
          </form>
        </Form>
      </div>

      {previewOpen && (
        <InvoicePreview
          previewUrl={previewUrl}
          closePreview={closePreview}
          handleDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default CreateInvoiceForm;
