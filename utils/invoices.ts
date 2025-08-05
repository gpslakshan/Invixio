import jsPDF from "jspdf";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

import { InvoiceData, InvoiceEmailData } from "@/types/invoices";

// Configure AWS SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

export async function sendInvoiceEmail(emailData: InvoiceEmailData) {
  try {
    // Create boundary for multipart message
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36)}`;

    // Construct the raw email message
    const rawMessage = [
      `From: ${process.env.SES_FROM_EMAIL}`, // Replace with verified sender email
      `To: ${emailData.recipientEmail}`,
      `Subject: Invoice ${emailData.invoice.invoiceNumber} from ${emailData.invoice.companyName}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      "Hello,",
      "",
      "Please find the attached Invoice.",
      "",
      "Best regards,",
      `${emailData.invoice.companyName}`,
      "",
      `--${boundary}`,
      "Content-Type: application/pdf",
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="invoice-${emailData.invoice.invoiceNumber}"`,
      "",
      emailData.pdfBase64,
      "",
      `--${boundary}--`,
    ].join("\n");

    // Send the email
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawMessage),
      },
      Source: process.env.SES_FROM_EMAIL!, // Must be verified in SES
      Destinations: [emailData.recipientEmail], // Can be multiple recipients
    });

    const result = await sesClient.send(command);
    console.log("Email sent successfully:", result.MessageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
