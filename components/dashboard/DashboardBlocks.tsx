import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, FileCheck, FileText, FileWarning } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  fetchUserCurrency,
  formatCurrencyValue,
  getCurrencySymbol,
  getCurrentUser,
} from "@/lib/utils";
import { subDays } from "date-fns";
import DashboardBlocksLoadingSkeletons from "./DashboardBlocksLoadingSkeletons";

async function getData(userId: string) {
  const [invoices, revenueInvoices, paidInvoices, openInvoices] =
    await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
        },
        select: {
          total: true,
        },
      }),

      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
          paidAt: {
            gte: subDays(new Date(), 30), // invoices paid in the last 30 days
          },
        },
        select: {
          total: true,
        },
      }),

      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
        },
        select: {
          id: true,
        },
      }),

      prisma.invoice.findMany({
        where: {
          userId,
          status: {
            in: ["PENDING", "OVERDUE"],
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

  return { invoices, revenueInvoices, paidInvoices, openInvoices };
}

async function DashboardBlocksContent() {
  const user = await getCurrentUser();
  const currency = await fetchUserCurrency(user?.id as string);
  const { invoices, revenueInvoices, paidInvoices, openInvoices } =
    await getData(user?.id as string);

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 md:gap-8 mb-2 md:mb-8">
      <Card className="gap-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">
            {getCurrencySymbol(currency)}{" "}
            {formatCurrencyValue(
              revenueInvoices.reduce((acc, invoice) => acc + invoice.total, 0)
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            Revenue from the last 30 days
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Invoices Issued</CardTitle>
          <FileText className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{invoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Total invoices issued to date
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <FileCheck className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{paidInvoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Invoices that have been paid
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Open Invoices</CardTitle>
          <FileWarning className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{openInvoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Invoices that haven&apos;t been paid
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const DashboardBlocks = () => {
  return (
    <Suspense fallback={<DashboardBlocksLoadingSkeletons />}>
      <DashboardBlocksContent />
    </Suspense>
  );
};

export default DashboardBlocks;
