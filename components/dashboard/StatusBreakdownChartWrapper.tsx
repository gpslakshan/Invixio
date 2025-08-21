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

const StatusBreakdownChartWrapper = () => {
  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>Invoice Status Breakdown</CardTitle>
        <CardDescription>
          A breakdown of all invoices by their status for the current month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusBreakdownChart />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          54.5% of invoices marked as paid <TrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          27.3% are Pending, and 18.2% are Overdue.
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatusBreakdownChartWrapper;
