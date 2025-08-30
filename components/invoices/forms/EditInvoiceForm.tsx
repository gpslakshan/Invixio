"use client";

import React from "react";
import { Form } from "@/components/ui/form";
import InvoiceFormActions from "./InvoiceFormActions";
import InvoicePreview from "./InvoicePreview";
import { InvoiceData, UserProfile } from "@/types";

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
  invoice: InvoiceData;
  profile: UserProfile;
}

const EditInvoiceForm = ({ invoice, profile }: Props) => {
  const {
    form,
    fields,
    watchedItems,
    subtotal,
    tax,
    discount,
    total,
    handleAddItem,
    handleRemoveItem,
  } = useInvoiceForm(profile, invoice);

  const {
    logoPreview,
    logoUrl,
    uploadingLogo,
    deletingLogo,
    handleLogoChange,
    removeLogo,
  } = useInvoiceLogo(invoice);

  const {
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
    invoiceId: invoice.id,
  });

  const sticky = useSticky(100);
  return (
    <div className="max-w-4xl mx-auto">
      <InvoiceFormActions
        isUploadingLogo={uploadingLogo}
        isDeletingLogo={deletingLogo}
        isSubmittingForm={submittingForm || isNavigating}
        isGeneratingPreview={generatingPreview}
        onPreview={handlePreview}
        onSendEmail={handleSendEmail}
        isSticky={sticky}
      />

      <div className="p-6 space-y-6 border shadow">
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
              currency={profile.currency}
              handleAddItem={handleAddItem}
              handleRemoveItem={handleRemoveItem}
            />

            {/* Summary Section */}
            <InvoiceSummary
              form={form}
              subtotal={subtotal}
              tax={tax}
              discount={discount}
              total={total}
              currency={profile.currency}
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

export default EditInvoiceForm;
