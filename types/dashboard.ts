import { LucideIcon } from "lucide-react";
import { JSX } from "react";

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
