"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/utils/auth";
import { InvoiceFormData } from "@/types/invoices";
import { invoiceSchema } from "@/lib/schemas/invoices";
import { revalidatePath } from "next/cache";
import { generateInvoicePDF, sendInvoiceEmail } from "@/utils/invoices";

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
      (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
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
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log("Invoice created and saved to DB successfully: ", invoice);

    // Generate PDF
    const pdfBase64 = await generateInvoicePDF(invoice);

    // Send email with PDF attachment
    const emailResult = await sendInvoiceEmail(invoice, pdfBase64);

    if (!emailResult.success) {
      console.error("Failed to send invoice email:", emailResult.error);
      return {
        status: "warning",
        message:
          "Invoice created successfully, but failed to send email. Please send manually.",
      };
    }

    console.log(`Invoice sent successfully to email: ${invoice.clientEmail}`);

    revalidatePath("/dashboard/invoices"); // Update cached invoices
    return {
      status: "success",
      message: "Invoice created and sent successfully.",
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: "error",
        message: "Database Error: Failed to create invoice.",
      };
    }

    return {
      status: "error",
      message: "Error creating invoice.",
    };
  }
}
