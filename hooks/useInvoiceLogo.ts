import { useState } from "react";
import { toast } from "sonner";
import { handleLogoUpload, deleteFromS3 } from "@/lib/utils";

export const useInvoiceLogo = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed MIME types
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.warning("Only PNG and JPEG images are allowed.");
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File size must be less than 5MB");
      return;
    }

    setLogoPreview(URL.createObjectURL(file));

    // Start upload process
    setUploadingLogo(true);
    try {
      const fileUrl = await handleLogoUpload(file);
      setLogoUrl(fileUrl);
      console.log("Logo uploaded successfully:", fileUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    setDeletingLogo(true);
    try {
      // Delete from S3 if logoUrl exists
      if (logoUrl) {
        await deleteFromS3(logoUrl);
      }
      // Clean up preview URL to prevent memory leaks
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      // Reset states
      setLogoPreview(null);
      setLogoUrl(null);
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo. Please try again.");
    } finally {
      setDeletingLogo(false);
    }
  };

  return {
    logoPreview,
    logoUrl,
    uploadingLogo,
    deletingLogo,
    handleLogoChange,
    removeLogo,
  };
};
