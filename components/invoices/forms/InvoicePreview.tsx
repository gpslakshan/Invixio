import { Button } from "@/components/ui/button";
import React from "react";

interface Props {
  previewUrl: string | null;
  closePreview: () => void;
  handleDownloadPDF: () => void;
}

const InvoicePreview = ({
  previewUrl,
  closePreview,
  handleDownloadPDF,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Invoice Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewUrl) {
                  window.open(previewUrl, "_blank");
                }
              }}
            >
              Open in New Tab
            </Button>
            <Button variant="ghost" size="sm" onClick={closePreview}>
              ✕
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 flex justify-between">
          <p className="text-sm text-gray-600 dark:text-white">
            This is a preview. Make changes in the form to see updates.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            <Button
              onClick={() => {
                closePreview();
                handleDownloadPDF();
              }}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
