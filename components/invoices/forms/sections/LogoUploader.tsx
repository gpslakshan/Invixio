"use client";

import React from "react";
import { UploadCloudIcon } from "lucide-react";
import Image from "next/image";

interface Props {
  logoPreview: string | null;
  uploadingLogo: boolean;
  deletingLogo: boolean;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
}

const LogoUploader = ({
  logoPreview,
  uploadingLogo,
  deletingLogo,
  handleLogoChange,
  removeLogo,
}: Props) => {
  return (
    <div className="w-full md:w-1/2">
      <div className="flex h-full justify-center items-center">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-400 relative overflow-hidden">
          {logoPreview ? (
            <div className="relative w-full h-full group">
              <Image
                src={logoPreview}
                alt="Logo"
                fill
                className="object-cover rounded-full"
              />
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                  <div className="text-white text-xs text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                    Uploading...
                  </div>
                </div>
              )}
              {deletingLogo && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                  <div className="text-white text-xs text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                    Deleting...
                  </div>
                </div>
              )}
              {!uploadingLogo && !deletingLogo && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full">
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-white text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded shadow"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <UploadCloudIcon size={24} />
              <span className="text-xs text-center">Upload Logo</span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleLogoChange}
                disabled={uploadingLogo}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
