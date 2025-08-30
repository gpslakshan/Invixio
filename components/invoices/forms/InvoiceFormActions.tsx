import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, EyeIcon, Mail } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  onPreview: () => void;
  onSendEmail: () => void;
  isUploadingLogo: boolean;
  isDeletingLogo: boolean;
  isSubmittingForm: boolean;
  isGeneratingPreview: boolean;
  isSticky: boolean;
}

const InvoiceFormActions = ({
  onPreview,
  onSendEmail,
  isUploadingLogo,
  isDeletingLogo,
  isSubmittingForm,
  isGeneratingPreview,
  isSticky,
}: Props) => {
  return (
    <div
      className={cn(
        "w-full bg-white dark:bg-gray-900 z-10 sticky top-0 p-4 flex flex-col md:flex-row gap-2 justify-between",
        isSticky ? "shadow-md" : ""
      )}
    >
      <Link
        className={buttonVariants({ variant: "secondary", size: "sm" })}
        href="/dashboard/invoices"
      >
        <ArrowLeft /> Go Back
      </Link>
      <div className="flex flex-col md:flex-row gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPreview}
          disabled={isGeneratingPreview}
        >
          <EyeIcon /> {isGeneratingPreview ? "Generating..." : "Preview"}
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={isUploadingLogo || isDeletingLogo || isSubmittingForm}
          onClick={onSendEmail}
        >
          <Mail />
          {isUploadingLogo
            ? "Uploading Logo..."
            : isDeletingLogo
              ? "Removing Logo..."
              : isSubmittingForm
                ? "Sending..."
                : "Send Email"}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFormActions;
