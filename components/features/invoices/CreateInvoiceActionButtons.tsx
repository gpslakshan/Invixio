import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DownloadIcon, EyeIcon, Mail } from "lucide-react";
import React from "react";

interface Props {
  onPreview: () => void;
  onDownloadPDF: () => void;
  onSendEmail: () => void;
  isUploadingLogo: boolean;
  isDeletingLogo: boolean;
  isSubmittingForm: boolean;
  isDownloadingPDF: boolean;
  isSticky: boolean;
}

const CreateInvoiceActionButtons = ({
  onPreview,
  onDownloadPDF,
  onSendEmail,
  isUploadingLogo,
  isDeletingLogo,
  isSubmittingForm,
  isDownloadingPDF,
  isSticky,
}: Props) => {
  return (
    <div
      className={cn(
        "w-full bg-white z-10 sticky top-0 p-4 flex flex-col md:flex-row gap-2 justify-between",
        isSticky ? "shadow-md" : ""
      )}
    >
      <Button variant="secondary" size="sm" onClick={onPreview}>
        <EyeIcon /> Preview
      </Button>
      <div className="flex flex-col md:flex-row gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadPDF}
          disabled={isDownloadingPDF}
        >
          <DownloadIcon />{" "}
          {isDownloadingPDF ? "Downloading..." : "Download PDF"}
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

export default CreateInvoiceActionButtons;
