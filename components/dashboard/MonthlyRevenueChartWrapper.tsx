import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import MonthlyRevenueChart from "./MonthlyRevenueChart";

const MonthlyRevenueChartWrapper = () => {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>
          Track your revenue performance for the past 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MonthlyRevenueChart />
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueChartWrapper;
