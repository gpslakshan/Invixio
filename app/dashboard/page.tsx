import DashboardBlocks from "@/components/dashboard/DashboardBlocks";
import MonthlyRevenueChartLoadingSkeletons from "@/components/dashboard/MonthlyRevenueChartLoadingSkeletons";
import MonthlyRevenueChartWrapper from "@/components/dashboard/MonthlyRevenueChartWrapper";
import StatusBreakdownChartLoadingSkeletons from "@/components/dashboard/StatusBreakdownChartLoadingSkeletons";
import StatusBreakdownChartWrapper from "@/components/dashboard/StatusBreakdownChartWrapper";
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
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
  );
}
