import jsPDF from "jspdf";
import { Resend } from "resend";

import InvoiceEmailTemplate from "@/emails/InvoiceEmailTemplate";
import { InvoiceData, InvoiceEmailData } from "@/types/invoices";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateInvoicePDF(
  invoice: InvoiceData
): Promise<Buffer> {
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
  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}

export async function sendInvoiceEmail({
  invoice,
  pdfBuffer,
  recipientEmail,
  senderEmail,
}: InvoiceEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [recipientEmail],
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
      react: InvoiceEmailTemplate({
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyName,
        clientName: invoice.clientName,
        total: invoice.total,
        dueDate: invoice.dueDate,
      }),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Failed to send email", error);
      throw new Error(`Failed to send email`);
    }

    console.log("Invoice email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
}
