import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get today's date at midnight UTC for consistent comparison
export function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
  return today;
}

// Function to get presigned URL from the API
export const getPresignedUrl = async (fileName: string, fileType: string) => {
  try {
    const response = await fetch("/api/upload/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
        folder: "logos", // Optional: organize files in folders
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

// Function to upload file to S3 using presigned URL
export const uploadToS3 = async (file: File, presignedUrl: string) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to S3");
    }

    return response;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

// Function to delete file from S3
export const deleteFromS3 = async (fileUrl: string) => {
  try {
    // Extract the S3 key from the file URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const response = await fetch("/api/upload/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file from S3");
    }

    console.log("File deleted from S3 successfully");
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
};

// Function to handle logo file upload process
export const handleLogoUpload = async (file: File) => {
  // Generate unique filename
  const fileId = uuidv4();
  const fileExtension = file.name.split(".").pop();
  const fileName = `logo_${fileId}.${fileExtension}`;

  // Get presigned URL
  const { presignedUrl, fileUrl } = await getPresignedUrl(fileName, file.type);

  // Upload to S3
  await uploadToS3(file, presignedUrl);

  return fileUrl;
};

// Helper function to create raw email with attachment
export function createRawEmailWithAttachment(
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlBody: string,
  attachmentBase64: string,
  attachmentName: string
): Buffer {
  const boundary = "----=_NextPart_" + Date.now();

  let rawEmail = "";

  // Email headers
  rawEmail += `From: ${fromEmail}\r\n`;
  rawEmail += `To: ${toEmail}\r\n`;
  rawEmail += `Subject: ${subject}\r\n`;
  rawEmail += `MIME-Version: 1.0\r\n`;
  rawEmail += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

  // HTML email body
  rawEmail += `--${boundary}\r\n`;
  rawEmail += `Content-Type: text/html; charset=UTF-8\r\n`;
  rawEmail += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
  rawEmail += `${htmlBody}\r\n\r\n`;

  // PDF attachment
  rawEmail += `--${boundary}\r\n`;
  rawEmail += `Content-Type: application/pdf\r\n`;
  rawEmail += `Content-Transfer-Encoding: base64\r\n`;
  rawEmail += `Content-Disposition: attachment; filename="${attachmentName}"\r\n\r\n`;

  // Convert base64 and add line breaks every 76 characters
  const base64WithLineBreaks =
    attachmentBase64.match(/.{1,76}/g)?.join("\r\n") || attachmentBase64;
  rawEmail += `${base64WithLineBreaks}\r\n\r\n`;

  rawEmail += `--${boundary}--\r\n`;

  return Buffer.from(rawEmail);
}
