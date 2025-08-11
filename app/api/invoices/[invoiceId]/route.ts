import { prisma } from "@/lib/db";
import {
  fetchUserCurrency,
  formatCurrencyWithSymbol,
  formatDate,
} from "@/lib/utils";
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

  const currency = await fetchUserCurrency();

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // set global font
  pdf.setFont("helvetica");

  // From section
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

  // To section
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
  pdf.text("Quantity", 100, 105, { align: "center" });
  pdf.text("Unit Price", 155, 105, { align: "right" });
  pdf.text("Amount", 190, 105, { align: "right" });
  // draw header line
  pdf.line(20, 107, 190, 107);

  // Invoice items
  pdf.setFont("helvetica", "normal");
  let offset = 0;
  for (let i = 0; i < invoice.items.length; i++) {
    pdf.text(invoice.items[i].description, 20, 115 + offset);
    pdf.text(invoice.items[i].quantity.toString(), 100, 115 + offset, {
      align: "center",
    });
    pdf.text(
      formatCurrencyWithSymbol(invoice.items[i].unitPrice, currency),
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

  if (invoice.notes) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Additional Notes: ", 20, 115 + offset + 60);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(invoice.notes, 20, 115 + offset + 67);
  }

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
