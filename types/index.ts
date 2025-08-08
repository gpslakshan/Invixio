import { invoiceSchema } from "@/lib/schemas";
import { JSX } from "react";
import { z } from "zod";

export interface InvoiceSummaryItem {
  title: string;
  value: string;
  description: string;
  icon: JSX.Element;
}

export interface QuickStatItem {
  title: string;
  value: string;
  description: string;
  icon: JSX.Element;
}

export interface RevenueByMonthItem {
  month: string;
  revenue: number;
}

export interface InvoiceStatusItem {
  name: "Paid" | "Unpaid" | "Overdue" | "Canceled";
  value: number;
}

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

  // Bank details
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankSortCode?: string | null;

  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
};
