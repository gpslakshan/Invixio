import DashboardBlocks from "@/components/dashboard/DashboardBlocks";
import EmptyState from "@/components/shared/EmptyState";
import MonthlyRevenueChartLoadingSkeletons from "@/components/dashboard/MonthlyRevenueChartLoadingSkeletons";
import MonthlyRevenueChartWrapper from "@/components/dashboard/MonthlyRevenueChartWrapper";
import StatusBreakdownChartLoadingSkeletons from "@/components/dashboard/StatusBreakdownChartLoadingSkeletons";
import StatusBreakdownChartWrapper from "@/components/dashboard/StatusBreakdownChartWrapper";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/utils";
import { Suspense } from "react";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  return data;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getData(user?.id as string);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-8">
        Get a quick overview of your invoices and revenue in one place.
      </p>
      {data.length > 0 ? (
        <>
          <DashboardBlocks />
          <div className="grid gap-3 xl:grid-cols-3 md:gap-8">
            <Suspense fallback={<MonthlyRevenueChartLoadingSkeletons />}>
              <MonthlyRevenueChartWrapper />
            </Suspense>
            <Suspense fallback={<StatusBreakdownChartLoadingSkeletons />}>
              <StatusBreakdownChartWrapper />
            </Suspense>
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
