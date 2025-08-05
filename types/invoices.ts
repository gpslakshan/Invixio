import { invoiceSchema } from "@/lib/schemas/invoices";
import { z } from "zod";

export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: string; // "pending" | "processing" | "success" | "failed"
  date: string;
};

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export type InvoiceData = {
  id: string;
  invoiceNumber: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string | null;
  logoUrl?: string | null;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
};

export type InvoiceEmailData = {
  invoice: {
    id: string;
    invoiceNumber: string;
    companyName: string;
    companyEmail: string;
    clientName: string;
    clientEmail: string;
    total: number;
    dueDate: Date;
  };
  pdfBase64: string;
  recipientEmail: string;
  senderEmail: string;
};
