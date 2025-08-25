import React from "react";
import { Skeleton } from "../ui/skeleton";

const MonthlyRevenueChartLoadingSkeletons = () => {
  return (
    <Skeleton className="xl:col-span-2 h-[390px] md:h-[550px] xl:h-[650px]" />
  );
};

export default MonthlyRevenueChartLoadingSkeletons;
