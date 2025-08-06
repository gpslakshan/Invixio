import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { prisma } from "@/lib/db";
import jsPDF from "jspdf";
import { SendRawEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import InvoiceEmailTemplate from "@/emails/InvoiceEmailTemplate";

import { sesClient } from "@/lib/ses";
import { InvoiceData } from "@/types";

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

export async function generateInvoicePDF(
  invoice: InvoiceData
): Promise<string> {
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
  const base64String = doc.output("datauristring").split(",")[1];
  return base64String;
}

// Email sending function
export async function sendInvoiceEmail(
  invoice: InvoiceData,
  pdfBase64: string
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
      })
    );

    // For attachments with SES, we need to use raw email format
    const rawEmailData = createRawEmailWithAttachment(
      process.env.SES_FROM_EMAIL!,
      invoice.clientEmail,
      `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
      emailHtml,
      pdfBase64,
      `invoice-${invoice.invoiceNumber}.pdf`
    );

    // Send raw email with attachment
    const rawEmailParams = {
      RawMessage: {
        Data: rawEmailData,
      },
    };

    const command = new SendRawEmailCommand(rawEmailParams);
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

// Helper function to create raw email with attachment
function createRawEmailWithAttachment(
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
