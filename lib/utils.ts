import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { prisma } from "@/lib/db";
import jsPDF from "jspdf";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import InvoiceEmailTemplate from "@/emails/InvoiceEmailTemplate";

import { sesClient } from "@/lib/ses";
import { InvoiceData } from "@/types";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, s3Client } from "./s3";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get today's date at midnight UTC for consistent comparison
export function getTodayDate() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
  return today;
}

export async function getCurrentUser() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return user;
}

export async function fetchUserCurrency(userId?: string): Promise<string> {
  if (!userId) {
    return "USD";
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true }, // Only fetch what you need
  });

  return user?.currency || "USD";
}

export async function fetchUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(date);
}

export async function getUserOnboardingStatus(
  user: KindeUser<Record<string, string>>
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const needsOnboarding = !existingUser?.hasOnboarded;
    return { status: "success", needsOnboarding };
  } catch (error) {
    console.log("an error occured while fetching the user.", error);
    return { status: "error", needsOnboarding: false };
  }
}

// Function to get presigned URL from the API
const getPresignedUrl = async (fileName: string, fileType: string) => {
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
const uploadToS3 = async (file: File, presignedUrl: string) => {
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

// Generate invoice number in format: #INV-20250001
export async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `#INV-${currentYear}`;

  // Get the latest invoice for this year to determine next sequence
  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let nextSequence = 1;
  if (latestInvoice) {
    // Extract sequence number from format: #INV-20250000001
    const numberPart = latestInvoice.invoiceNumber.replace(`${prefix}`, "");
    const sequenceNumber = parseInt(numberPart);
    if (!isNaN(sequenceNumber)) {
      nextSequence = sequenceNumber + 1;
    }
  }

  // Check if we've exceeded 999999 invoices for this year (extremely unlikely)
  if (nextSequence > 999999) {
    throw new Error(
      `Maximum invoices reached for year ${currentYear}. ` +
        `Consider implementing a more advanced numbering scheme.`
    );
  }

  // Format: #INV-YYYY000001 (e.g., #INV-2025000001, #INV-2025000002)
  return `${prefix}${nextSequence.toString().padStart(6, "0")}`;
}

export function generateInvoicePDF(invoice: InvoiceData): Buffer<ArrayBuffer> {
  // Generate PDF
  const doc = new jsPDF();

  // Add logo if exists
  if (invoice.logoUrl) {
    // Note: jsPDF has limitations with image types in server environment
    // You might need to use a base64 encoded image or a data URL
    // doc.addImage(logoUrl, 'JPEG', 15, 15, 50, 20);
  }

  // Add invoice information
  doc.setFontSize(18);
  doc.text(`INVOICE #${invoice.invoiceNumber}`, 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`From: ${invoice.companyName}`, 20, 40);
  doc.text(`To: ${invoice.clientName}`, 20, 50);

  // Add invoice items table
  doc.text("Description", 20, 70);
  doc.text("Qty", 100, 70);
  doc.text("Unit Price", 130, 70);
  doc.text("Amount", 160, 70);

  let yPosition = 80;
  invoice.items.forEach((item) => {
    doc.text(item.description, 20, yPosition);
    doc.text(item.quantity.toString(), 100, yPosition);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 130, yPosition);
    doc.text(`$${item.amount.toFixed(2)}`, 160, yPosition);
    yPosition += 10;
  });

  // Add totals
  yPosition += 10;
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 130, yPosition);
  yPosition += 10;
  doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 130, yPosition);
  yPosition += 10;
  doc.text(`Discount: $${invoice.discount.toFixed(2)}`, 130, yPosition);
  yPosition += 10;
  doc.setFontSize(14);
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 130, yPosition);

  // Convert to buffer
  const arrayBuffer = doc.output("arraybuffer");
  const pdfOutput = Buffer.from(arrayBuffer);
  return pdfOutput;
}

// function to upload PDF to S3
export async function uploadPDFToS3(
  pdfBuffer: Buffer<ArrayBuffer>,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate S3 key with folder structure
    const s3Key = `invoices/${fileName}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename="${fileName}"`,
    });

    await s3Client.send(uploadCommand);

    // Generate the S3 URL
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${s3Key}`;

    return {
      success: true,
      url: s3Url,
    };
  } catch (error) {
    console.error("Error uploading PDF to S3:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown S3 upload error",
    };
  }
}

// Email sending function
export async function sendInvoiceEmail(
  invoice: InvoiceData,
  downloadUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Render the email template to HTML
    const emailHtml = await render(
      InvoiceEmailTemplate({
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyName,
        clientName: invoice.clientName,
        total: invoice.total,
        dueDate: new Date(invoice.dueDate),
        downloadUrl: downloadUrl,
      })
    );

    const params: SendEmailCommandInput = {
      Source: process.env.SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [invoice.clientEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailHtml,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
        },
      },
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
