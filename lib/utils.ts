import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { prisma } from "@/lib/db";
import jsPDF from "jspdf";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import CreateInvoiceEmailTemplate from "@/emails/CreateInvoiceEmailTemplate";

import { sesClient } from "@/lib/ses";
import { EmailType, InvoiceData } from "@/types";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, s3Client } from "./s3";
import EditInvoiceEmailTemplate from "@/emails/EditInvoiceEmailTemplate";
import ReminderInvoiceEmailTemplate from "@/emails/ReminderInvoiceEmailTemplate";
import DeleteInvoiceEmailTemplate from "@/emails/DeleteInvoiceEmailTemplate";

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

export function getCurrencySymbol(currencyCode: string, locale = "en") {
  return (0)
    .toLocaleString(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, "")
    .trim();
}

// Helper function to format currency with 2 decimal places
export const formatCurrencyValue = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return numValue.toFixed(2);
};

// Helper function to format currency with symbol and 2 decimal places
export const formatCurrencyWithSymbol = (
  value: number | string,
  currency: string
): string => {
  return `${getCurrencySymbol(currency)} ${formatCurrencyValue(value)}`;
};

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
): Promise<Buffer<ArrayBuffer>> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // fetch user currency
  const currency = await fetchUserCurrency();

  // set global font
  pdf.setFont("helvetica");

  // Issuer Details section
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Issuer Details", 20, 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  // Individual lines with increased spacing (6mm between lines)
  pdf.text(invoice.companyName, 20, 28);
  pdf.text(invoice.companyEmail, 20, 34);
  pdf.text(invoice.companyAddress, 20, 40);

  // Add company logo if it exists
  if (invoice.logoUrl) {
    try {
      // Fetch the image
      const response = await fetch(invoice.logoUrl);
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString("base64");

        // Determine image format from URL or content type
        const contentType = response.headers.get("content-type") || "";
        let format = "JPEG"; // default
        if (
          contentType.includes("png") ||
          invoice.logoUrl.toLowerCase().includes(".png")
        ) {
          format = "PNG";
        }

        // Add the logo (positioned to the right of issuer details)
        // Logo position: x=130mm (right side), y=20mm (top), width=50mm, height=30mm
        pdf.addImage(
          `data:${contentType};base64,${imageBase64}`,
          format,
          140,
          10,
          30,
          30
        );
      }
    } catch (error) {
      console.error("Error loading logo:", error);
      // Continue without logo if there's an error
    }
  }

  // Client Details section
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Client Details", 20, 65);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  // Individual lines with increased spacing (6mm between lines)
  pdf.text(invoice.clientName, 20, 73);
  pdf.text(invoice.clientEmail, 20, 79);
  pdf.text(invoice.clientAddress, 20, 85);

  // Invoice Details (positioned below the logo area)
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice Details", 130, 65);
  pdf.setFontSize(12);
  // Individual lines with bold labels and normal values
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice No:", 130, 73);
  pdf.setFont("helvetica", "normal");
  pdf.text(invoice.invoiceNumber, 158, 73);
  pdf.setFont("helvetica", "bold");
  pdf.text("Issued Date:", 130, 79);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(invoice.invoiceDate), 158, 79);
  pdf.setFont("helvetica", "bold");
  pdf.text("Due Date:", 130, 85);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(invoice.dueDate), 158, 85);

  // Invoice Items Header
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, 105);
  pdf.text("Quantity", 120, 105, { align: "center" });
  pdf.text("Rate", 155, 105, { align: "right" });
  pdf.text("Amount", 190, 105, { align: "right" });
  // draw header line
  pdf.line(20, 107, 190, 107);

  // Invoice items
  pdf.setFont("helvetica", "normal");
  let offset = 0;
  for (let i = 0; i < invoice.items.length; i++) {
    pdf.text(invoice.items[i].description, 20, 115 + offset);
    pdf.text(invoice.items[i].quantity.toString(), 120, 115 + offset, {
      align: "center",
    });
    pdf.text(
      formatCurrencyWithSymbol(invoice.items[i].rate, currency),
      155,
      115 + offset,
      { align: "right" }
    );
    pdf.text(
      formatCurrencyWithSymbol(invoice.items[i].amount, currency),
      190,
      115 + offset,
      { align: "right" }
    );
    offset += 10;
  }

  // Total section
  pdf.line(20, 115 + offset - 7, 190, 115 + offset - 7);
  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal", 130, 115 + offset + 10);
  pdf.text(
    formatCurrencyWithSymbol(invoice.subtotal, currency),
    190,
    115 + offset + 10,
    {
      align: "right",
    }
  );
  pdf.setFont("helvetica", "normal");
  pdf.text("Tax", 130, 115 + offset + 15);
  pdf.text(
    formatCurrencyWithSymbol(invoice.tax, currency),
    190,
    115 + offset + 15,
    {
      align: "right",
    }
  );
  pdf.text("Discount", 130, 115 + offset + 20);
  pdf.text(
    `-${formatCurrencyWithSymbol(invoice.discount, currency)}`,
    190,
    115 + offset + 20,
    { align: "right" }
  );
  pdf.line(130, 115 + offset + 23, 190, 115 + offset + 23);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total", 130, 115 + offset + 30);
  pdf.text(
    formatCurrencyWithSymbol(invoice.total, currency),
    190,
    115 + offset + 30,
    {
      align: "right",
    }
  );
  pdf.setFont("helvetica", "normal");
  pdf.line(130, 115 + offset + 34, 190, 115 + offset + 34);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Payment Instructions: ", 20, 115 + offset + 60);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(invoice.paymentInstructions, 20, 115 + offset + 67, {
    maxWidth: 170,
  });

  if (invoice.notes) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Additional Notes: ", 20, 115 + offset + 105);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(invoice.notes, 20, 115 + offset + 112, { maxWidth: 170 });
  }

  // Generate PDF as Buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
  return pdfBuffer;
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
      ContentDisposition: `inline; filename="${fileName}"`,
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

/**
 * Sends an invoice email based on the specified type.
 * @param invoice The invoice data.
 * @param downloadUrl The URL to download the invoice.
 * @param emailType The type of email to send (CREATE, EDIT, REMINDER, or CANCEL).
 * @returns An object indicating success or failure.
 */
export async function sendInvoiceEmail(
  invoice: InvoiceData,
  downloadUrl?: string, // Made optional for cancel email
  emailType: EmailType = EmailType.CREATE // Default to 'create'
): Promise<{ success: boolean; error?: string }> {
  try {
    let emailHtml: string;
    let emailSubject: string;

    switch (emailType) {
      case EmailType.EDIT:
        emailHtml = await render(
          EditInvoiceEmailTemplate({
            invoiceNumber: invoice.invoiceNumber,
            companyName: invoice.companyName,
            clientName: invoice.clientName,
            total: invoice.total,
            dueDate: new Date(invoice.dueDate),
            downloadUrl: downloadUrl!,
          })
        );
        emailSubject = `Updated Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`;
        break;

      case EmailType.REMINDER:
        emailHtml = await render(
          ReminderInvoiceEmailTemplate({
            invoiceNumber: invoice.invoiceNumber,
            companyName: invoice.companyName,
            clientName: invoice.clientName,
            total: invoice.total,
            dueDate: new Date(invoice.dueDate),
            downloadUrl: downloadUrl!,
          })
        );
        emailSubject = `Payment Reminder: Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`;
        break;

      case EmailType.DELETE:
        emailHtml = await render(
          DeleteInvoiceEmailTemplate({
            invoiceNumber: invoice.invoiceNumber,
            companyName: invoice.companyName,
            clientName: invoice.clientName,
          })
        );
        emailSubject = `Invoice ${invoice.invoiceNumber} from ${invoice.companyName} Has Been Deleted`;
        break;

      case EmailType.CREATE:
      default:
        // Default case for 'create'
        emailHtml = await render(
          CreateInvoiceEmailTemplate({
            invoiceNumber: invoice.invoiceNumber,
            companyName: invoice.companyName,
            clientName: invoice.clientName,
            total: invoice.total,
            dueDate: new Date(invoice.dueDate),
            downloadUrl: downloadUrl!,
          })
        );
        emailSubject = `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`;
        break;
    }

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
          Data: emailSubject,
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
