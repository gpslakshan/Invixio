"use server";

import { prisma } from "@/lib/db";
import { BUCKET_NAME } from "@/lib/s3";
import { invoiceSchema } from "@/lib/schemas";
import {
  getCurrentUser,
  generateInvoicePDF,
  sendInvoiceEmail,
  uploadPDFToS3,
} from "@/lib/utils";
import { EmailType, InvoiceFormData } from "@/types";
import { InvoiceStatus } from "@prisma/client";
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
      console.warn(
        "Invoice created successfully but failed to send invoice email: ",
        emailResult.error
      );
      return {
        status: "warning",
        message:
          "Invoice created successfully, but the email failed to send. Please send it manually.",
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

export async function editInvoice(
  invoiceId: string,
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

    // Update invoice in database
    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id,
      },
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
        items: {
          // First, delete all existing invoice items for this invoice
          deleteMany: {},
          // Then, create the new items from the form data
          createMany: {
            data: validatedData.data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: (item.quantity || 0) * (item.rate || 0),
            })),
          },
        },
        paymentInstructions: validatedData.data.paymentInstructions,
      },
      include: {
        items: true,
      },
    });

    console.log("Invoice updated and saved to DB successfully: ", invoice);

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
    const emailResult = await sendInvoiceEmail(
      invoice,
      s3UploadResult.url!,
      EmailType.EDIT
    );

    if (!emailResult.success) {
      console.warn(
        "Invoice updated successfully but failed to send invoice email: ",
        emailResult.error
      );
      return {
        status: "warning",
        message:
          "Invoice updated successfully, but the email failed to send. Please send it manually.",
      };
    }

    console.log(`Invoice sent successfully to email: ${invoice.clientEmail}`);

    return {
      status: "success",
      message: "Invoice updated and email sent successfully",
    };
  } catch (error) {
    console.error("Error updating the invoice:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to mark the invoice as paid",
      };
    }

    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id, // Security check: Ensure the user owns the invoice
      },
      data: {
        status: InvoiceStatus.PAID,
      },
    });

    console.log(`Invoice ${updatedInvoice.id} marked as paid.`);
    revalidatePath("/dashboard/invoices");
    return {
      status: "success",
      message: "Invoice successfully marked as paid.",
    };
  } catch (error) {
    console.error("Error marking the invoice as paid:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function markInvoiceAsUnpaid(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to mark the invoice as unpaid.",
      };
    }

    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id, // Security check: Ensure the user owns the invoice
      },
      data: {
        status: InvoiceStatus.PENDING,
      },
    });

    console.log(`Invoice ${updatedInvoice.id} marked as unpaid.`);
    revalidatePath("/dashboard/invoices");
    return {
      status: "success",
      message: "Invoice successfully marked as unpaid.",
    };
  } catch (error) {
    console.error("Error marking the invoice as unpaid:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function downloadInvoice(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to download the invoice",
      };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: user.id },
      include: { items: true },
    });

    if (!invoice) {
      return {
        status: "error",
        message: "invoice not found!",
      };
    }

    const fileName = `invoice-${invoiceId}.pdf`;
    const s3Key = `invoices/${fileName}`;

    // Construct the public URL.
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${s3Key}`;

    console.log("Successfully fetched the invoice PDF from S3");

    return {
      status: "success",
      message: "Successfully downloaded the invoice",
      data: s3Url,
    };
  } catch (error) {
    console.error("Error downloading the invoice:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function sendReminderEmail(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to send the reminder invoice email",
      };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: user.id },
      include: { items: true },
    });

    if (!invoice) {
      return {
        status: "error",
        message: "invoice not found!",
      };
    }

    const fileName = `invoice-${invoiceId}.pdf`;
    const s3Key = `invoices/${fileName}`;

    // Construct the public URL.
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${s3Key}`;

    console.log("Successfully constructed the invoice PDF's S3 URL: ", s3Url);

    // Send email with S3 download link
    const emailResult = await sendInvoiceEmail(
      invoice,
      s3Url,
      EmailType.REMINDER
    );

    if (!emailResult.success) {
      console.error(
        "Failed to send the invoice reminder email: ",
        emailResult.error
      );
      return {
        status: "error",
        message: "Failed to send the invoice reminder email. Please try again.",
      };
    }

    console.log(
      `Invoice reminder sent successfully to email: ${invoice.clientEmail}`
    );

    return {
      status: "success",
      message: `Successfully sent the reminder email to ${invoice.clientEmail}`,
    };
  } catch (error) {
    console.error("Error sending the invoice reminder email:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function cancelInvoice(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to cancel the invoice.",
      };
    }

    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id, // Security check: Ensure the user owns the invoice
      },
      data: {
        status: InvoiceStatus.CANCELLED,
      },
      include: {
        items: true,
      },
    });

    console.log(`Invoice ${updatedInvoice.id} marked as cancelled.`);

    const emailResult = await sendInvoiceEmail(
      updatedInvoice,
      undefined,
      EmailType.CANCEL
    );

    if (!emailResult.success) {
      console.warn(
        "Failed to send the invoice cancellation email: ",
        emailResult.error
      );
      return {
        status: "warning",
        message:
          "Invoice status updated to cancelled, but the cancellation email failed to send. You may need to notify the client manually.",
      };
    }

    console.log(
      `invoice cancellation email successfully sent to: ${updatedInvoice.clientEmail}`
    );

    revalidatePath("/dashboard/invoices");
    return {
      status: "success",
      message: "Invoice has been successfully cancelled.",
    };
  } catch (error) {
    console.error("Error cancelling the invoice:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
