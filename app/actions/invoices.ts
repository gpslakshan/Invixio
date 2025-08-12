"use server";

import { prisma } from "@/lib/db";
import { invoiceSchema } from "@/lib/schemas";
import {
  getCurrentUser,
  generateInvoicePDF,
  sendInvoiceEmail,
  uploadPDFToS3,
} from "@/lib/utils";
import { InvoiceFormData } from "@/types";
import { revalidatePath } from "next/cache";

export async function createInvoice(
  formData: InvoiceFormData,
  logoUrl: string | null
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to create an invoice",
      };
    }

    const validatedData = invoiceSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        status: "error",
        message: "Invalid form data. Please check your inputs.",
      };
    }

    // Calculate amounts
    const subtotal = validatedData.data.items.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
      0
    );

    const total =
      subtotal +
      (validatedData.data.tax || 0) -
      (validatedData.data.discount || 0);

    // Create invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: validatedData.data.invoiceNumber,
        companyName: validatedData.data.companyName,
        companyEmail: validatedData.data.companyEmail,
        companyAddress: validatedData.data.companyAddress,
        clientName: validatedData.data.clientName,
        clientEmail: validatedData.data.clientEmail,
        clientAddress: validatedData.data.clientAddress,
        invoiceDate: validatedData.data.invoiceDate,
        dueDate: validatedData.data.dueDate,
        subtotal,
        tax: validatedData.data.tax || 0,
        discount: validatedData.data.discount || 0,
        total,
        notes: validatedData.data.notes,
        logoUrl: logoUrl,
        userId: user.id,
        items: {
          create: validatedData.data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
        paymentInstructions: validatedData.data.paymentInstructions,
      },
      include: {
        items: true,
      },
    });

    console.log("Invoice created and saved to DB successfully: ", invoice);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Upload PDF to S3
    const s3UploadResult = await uploadPDFToS3(
      pdfBuffer,
      `invoice-${invoice.id}.pdf`
    );

    if (!s3UploadResult.success) {
      console.error("Failed to upload PDF to S3:", s3UploadResult.error);
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }

    console.log("PDF uploaded to S3 successfully:", s3UploadResult.url);

    // Send email with S3 download link
    const emailResult = await sendInvoiceEmail(invoice, s3UploadResult.url!);

    if (!emailResult.success) {
      console.error(
        "Invoice created successfully but failed to send invoice email:",
        emailResult.error
      );
      return {
        status: "warning",
        message:
          "Invoice created successfully, but the email failed to send. Check the customer's email address and resend the invoice from the 'Actions' menu. If the problem continues, please contact support.",
      };
    }

    console.log(`Invoice sent successfully to email: ${invoice.clientEmail}`);

    return {
      status: "success",
      message: "Invoice created and email sent successfully",
    };
  } catch (error) {
    console.error("Error creating invoice:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
