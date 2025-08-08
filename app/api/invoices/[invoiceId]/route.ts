import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      items: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found"); // this is only for development mode
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // set global font
  pdf.setFont("helvetica");

  // From section
  pdf.setFontSize(16);
  pdf.text("From:", 20, 20);
  pdf.setFontSize(12);
  pdf.text(
    [invoice.companyName, invoice.companyEmail, invoice.companyAddress],
    20,
    25
  );

  // To section
  pdf.setFontSize(16);
  pdf.text("Bill To:", 20, 60);
  pdf.setFontSize(12);
  pdf.text(
    [invoice.clientName, invoice.clientEmail, invoice.clientAddress],
    20,
    65
  );

  // Invoice Details
  pdf.setFontSize(16);
  pdf.text("Invoice Details:", 120, 60);
  pdf.setFontSize(12);
  pdf.text(
    [
      `Invoice No: ${invoice.invoiceNumber}`,
      `Issued Date: ${formatDate(invoice.invoiceDate)}`,
      `Due Date: ${formatDate(invoice.dueDate)}`,
    ],
    120,
    65
  );

  // Generate PDF as Buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  // return PDF as download
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
