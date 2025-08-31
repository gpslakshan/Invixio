"use server";

import { prisma } from "@/lib/db";
import { BUCKET_NAME } from "@/lib/s3";
import { invoiceSchema } from "@/lib/schemas";
import {
  getCurrentUser,
  generateInvoicePDF,
  sendInvoiceEmail,
  uploadPDFToS3,
  getDateRangeForPricingMonth,
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

    // Check if the user is on the free plan and has reached the limit
    const { startOfMonth, nextMonth } = getDateRangeForPricingMonth();
    const [subscription, invoiceCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          status: true,
        },
      }),
      prisma.invoice.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: startOfMonth,
            lt: nextMonth,
          },
        },
      }),
    ]);

    const isFreePlan = !subscription || subscription.status !== "active";
    const hasReachedLimit = invoiceCount >= 5;

    if (isFreePlan && hasReachedLimit) {
      return {
        status: "error",
        message:
          "You have reached your monthly invoice limit of 5. Please upgrade your plan to create more.",
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

    const tax = subtotal * ((validatedData.data.taxPercentage || 0) / 100);
    const discount =
      subtotal * ((validatedData.data.discountPercentage || 0) / 100);

    const total = subtotal + tax - discount;

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
        taxPercentage: validatedData.data.taxPercentage || 0,
        discountPercentage: validatedData.data.discountPercentage || 0,
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
        message: "You must be logged in to update an invoice",
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
    const tax = subtotal * ((validatedData.data.taxPercentage || 0) / 100);
    const discount =
      subtotal * ((validatedData.data.discountPercentage || 0) / 100);

    const total = subtotal + tax - discount;

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
        taxPercentage: validatedData.data.taxPercentage || 0,
        discountPercentage: validatedData.data.discountPercentage || 0,
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
        paidAt: new Date(),
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

    // Step 1: Fetch the invoice with dueDate
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: user.id, // Security check
      },
      select: {
        dueDate: true,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Step 2: Compare current date with dueDate
    const now = new Date();
    const status =
      now <= invoice.dueDate ? InvoiceStatus.PENDING : InvoiceStatus.OVERDUE;

    // Step 3: Update with conditional status
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id,
      },
      data: {
        status,
        paidAt: null,
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

export async function deleteInvoice(invoiceId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to delete the invoice.",
      };
    }

    const deletedInvoice = await prisma.invoice.delete({
      where: {
        id: invoiceId,
        userId: user.id, // Security check: Ensure the user owns the invoice
      },
      include: {
        items: true,
      },
    });

    console.log(`Invoice ${deletedInvoice.id} deleted successfully.`);

    const emailResult = await sendInvoiceEmail(
      deletedInvoice,
      undefined,
      EmailType.DELETE
    );

    if (!emailResult.success) {
      console.warn(
        "Failed to send the invoice deletion email: ",
        emailResult.error
      );
      return {
        status: "warning",
        message:
          "Invoice deleted successfully, but the deletion email failed to send. You may need to notify the client manually.",
      };
    }

    console.log(
      `invoice deletion email successfully sent to: ${deletedInvoice.clientEmail}`
    );

    revalidatePath("/dashboard/invoices");
    return {
      status: "success",
      message: "Invoice has been successfully deleted.",
    };
  } catch (error) {
    console.error("Error deleting the invoice:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function getInvoiceStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { startOfMonth, nextMonth } = getDateRangeForPricingMonth();

    // Get invoice count for current month
    const invoiceCount = await prisma.invoice.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth,
          lt: nextMonth,
        },
      },
    });

    // Check if user has active subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        status: true,
      },
    });

    const isPro = subscription?.status === "active";

    return {
      success: true,
      data: {
        invoiceCount,
        isPro,
        maxInvoices: isPro ? Infinity : 5,
      },
    };
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return {
      success: false,
      error: "Failed to fetch invoice statistics",
    };
  }
}
