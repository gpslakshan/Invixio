import React from "react";
import { Skeleton } from "../ui/skeleton";

const DashboardBlocksLoadingSkeletons = () => {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 md:gap-8 mb-2 md:mb-8">
      <Skeleton className="h-[125px] w-full" />

      <Skeleton className="h-[125px] w-full" />

      <Skeleton className="h-[125px] w-full" />

      <Skeleton className="h-[125px] w-full" />
    </div>
  );
};

export default DashboardBlocksLoadingSkeletons;
