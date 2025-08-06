import jsPDF from "jspdf";
import { SendRawEmailCommand } from "@aws-sdk/client-ses";

import { InvoiceData } from "@/types/invoices";
import { render } from "@react-email/components";
import InvoiceEmailTemplate from "@/emails/InvoiceEmailTemplate";
import { sesClient } from "@/lib/ses";
import { createRawEmailWithAttachment } from "@/lib/utils";

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
  invoice: any,
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
