import { InvoiceStatusBreakdownPieChart } from "@/components/dashboard/InvoiceStatusBreakdownPieChart";
import { InvoiceSummaryCard } from "@/components/dashboard/InvoiceSummaryCard";
import { MonthlyRevenueBarChart } from "@/components/dashboard/MonthlyRevenueBarChart";
import { QuickStatsCard } from "@/components/dashboard/QuickStatsCard";
import {
  InvoiceStatusItem,
  InvoiceSummaryItem,
  QuickStatItem,
  RevenueByMonthItem,
} from "@/types";
import {
  DollarSign,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const invoiceSummary: InvoiceSummaryItem[] = [
  {
    title: "Paid",
    description: "Total amount received from clients.",
    icon: <CheckCircle2 className="text-green-600 size-6" />,
    value: "$12,400",
  },
  {
    title: "Unpaid",
    description: "Invoices pending client payment.",
    icon: <Clock className="text-yellow-500 size-6" />,
    value: "$3,200",
  },
  {
    title: "Overdue",
    description: "Invoices past their due date.",
    icon: <AlertTriangle className="text-red-600 size-6" />,
    value: "$1,100",
  },
];

const quickStats: QuickStatItem[] = [
  {
    title: "Clients",
    description: "Total active clients in your system.",
    icon: <Users className="text-primary size-6" />,
    value: "42",
  },
  {
    title: "Invoices",
    description: "All invoices issued to date.",
    icon: <FileText className="text-primary size-6" />,
    value: "113",
  },
  {
    title: "Revenue",
    description: "Gross revenue from all invoices.",
    icon: <DollarSign className="text-primary size-6" />,
    value: "$15,700",
  },
];

const revenueByMonth: RevenueByMonthItem[] = [
  { month: "Jan", revenue: 2400 },
  { month: "Feb", revenue: 1398 },
  { month: "Mar", revenue: 9800 },
  { month: "Apr", revenue: 3908 },
  { month: "May", revenue: 4800 },
];

const invoiceStatusData: InvoiceStatusItem[] = [
  { name: "Paid", value: 65 },
  { name: "Unpaid", value: 25 },
  { name: "Overdue", value: 10 },
];

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your invoices, clients, and business performance.
        </p>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {invoiceSummary.map((item) => (
          <InvoiceSummaryCard key={item.title} item={item} />
        ))}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((item) => (
          <QuickStatsCard key={item.title} item={item} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyRevenueBarChart data={revenueByMonth} />
        <InvoiceStatusBreakdownPieChart data={invoiceStatusData} />
      </div>
    </div>
  );
}
