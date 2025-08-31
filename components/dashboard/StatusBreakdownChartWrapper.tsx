import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import StatusBreakdownChart from "./StatusBreakdownChart";
import { TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { prisma } from "@/lib/db";

async function getData(userId: string): Promise<
  {
    status: string;
    count: number;
    fill: string;
  }[]
> {
  // Get the start and end of the current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  // Define colors for the chart based on status.
  // Note: These should match the CSS variables defined in the global styles or component.
  const statusColors = {
    PAID: "var(--color-paid)",
    PENDING: "var(--color-pending)",
    OVERDUE: "var(--color-overdue)",
  };

  // Use Prisma's `groupBy` to count invoices for the current user within the current month,
  // grouped by their status.
  const invoiceCounts = await prisma.invoice.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
    where: {
      userId: userId,
      createdAt: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
      // Exclude DRAFT invoices from the breakdown, as they are not yet finalized.
      status: {
        not: "DRAFT",
      },
    },
  });

  // Transform the result into the desired format for the chart
  const chartData = invoiceCounts.map((group) => ({
    status: group.status.toLowerCase(),
    count: group._count.status,
    // Add the corresponding color for each status.
    fill: statusColors[group.status as keyof typeof statusColors],
  }));

  // Return the formatted data
  return chartData;
}

const StatusBreakdownChartWrapper = async () => {
  const user = await getCurrentUser();
  const chartData = await getData(user?.id as string);
  const totalInvoices = chartData.reduce((sum, item) => sum + item.count, 0); // Calculate the total number of invoices
  const isEmptyState = totalInvoices === 0;

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Invoice Status Breakdown</CardTitle>
        <CardDescription>
          A breakdown of all invoices by their status for the current month.
        </CardDescription>
      </CardHeader>
      {isEmptyState ? (
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-gray-500 text-center">
            No invoices found for this month.
          </p>
        </CardContent>
      ) : (
        <>
          <CardContent>
            <StatusBreakdownChart chartData={chartData} />
          </CardContent>

          <CardFooter className="flex-col gap-2 text-sm">
            {/* Calculate percentages here to avoid unnecessary calculations in the empty state */}
            {(() => {
              const paidPercentage =
                (chartData.find((item) => item.status === "paid")?.count || 0) /
                totalInvoices;

              const pendingPercentage =
                (chartData.find((item) => item.status === "pending")?.count ||
                  0) / totalInvoices;

              const overduePercentage =
                (chartData.find((item) => item.status === "overdue")?.count ||
                  0) / totalInvoices;

              return (
                <>
                  <div className="flex items-center gap-2 leading-none font-medium text-center">
                    {`${(paidPercentage * 100).toFixed(1)}% of invoices marked as paid`}
                    {paidPercentage > 0 && <TrendingUp className="size-4" />}
                  </div>

                  <div className="text-muted-foreground leading-none text-center">
                    {`${(pendingPercentage * 100).toFixed(1)}% are Pending, and ${(overduePercentage * 100).toFixed(1)}% are Overdue.`}
                  </div>
                </>
              );
            })()}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default StatusBreakdownChartWrapper;
