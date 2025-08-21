import DashboardBlocks from "@/components/dashboard/DashboardBlocks";
import MonthlyRevenueChartWrapper from "@/components/dashboard/MonthlyRevenueChartWrapper";
import StatusBreakdownChartWrapper from "@/components/dashboard/StatusBreakdownChartWrapper";

export default async function DashboardPage() {
  return (
    <>
      <DashboardBlocks />
      <div className="grid gap-3 xl:grid-cols-3 md:gap-8">
        <MonthlyRevenueChartWrapper />
        <StatusBreakdownChartWrapper />
      </div>
    </>
  );
}
