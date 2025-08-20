import { invoiceSchema, onboardingSchema } from "@/lib/schemas";
import { InvoiceStatus } from "@prisma/client";
import { JSX } from "react";
import { z } from "zod";

export type UserProfile = {
  currency: string;
  companyName: string;
  email: string;
  companyEmail: string;
  companyAddress: string;
  id: string;
  firstName: string;
  lastName: string;
  hasOnboarded: boolean;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceSummaryItem = {
  title: string;
  value: string;
  description: string;
  icon: JSX.Element;
};

export type QuickStatItem = {
  title: string;
  value: string;
  description: string;
  icon: JSX.Element;
};

export type RevenueByMonthItem = {
  month: string;
  revenue: number;
};

export type InvoiceStatusItem = {
  name: "Paid" | "Unpaid" | "Overdue" | "Canceled";
  value: number;
};

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export type InvoiceDataTableItem = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: InvoiceStatus;
  invoiceDate: Date;
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
  status: InvoiceStatus;
  paymentInstructions: string;

  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
};

export enum EmailType {
  CREATE = "create",
  EDIT = "edit",
  REMINDER = "reminder",
  DELETE = "delete",
}
