import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import MonthlyRevenueChart from "./MonthlyRevenueChart";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

async function getData(userId: string): Promise<
  {
    month: string;
    revenue: number;
  }[]
> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: userId,
      status: "PAID",
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const monthlyRevenueMap = new Map();

  invoices.forEach((invoice) => {
    const month = invoice.createdAt.toLocaleString("default", {
      month: "short",
    });
    const year = invoice.createdAt.getFullYear();
    const key = `${month}-${year}`;

    if (monthlyRevenueMap.has(key)) {
      monthlyRevenueMap.set(key, monthlyRevenueMap.get(key) + invoice.total);
    } else {
      monthlyRevenueMap.set(key, invoice.total);
    }
  });

  // Generate a list of the last 6 months to ensure the chart has 6 data points, even if a month has no revenue.
  const allMonths = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    const month = currentDate.toLocaleString("default", { month: "short" });
    const year = currentDate.getFullYear();
    allMonths.unshift(`${month}-${year}`);
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  // Format the data for the chart, using 0 for months with no revenue
  const chartData = allMonths.map((monthKey) => {
    const [month] = monthKey.split("-");
    const revenue = monthlyRevenueMap.get(monthKey) || 0;
    return { month: month, revenue: revenue };
  });

  return chartData;
}

const MonthlyRevenueChartWrapper = async () => {
  const user = await getCurrentUser();
  const chartData = await getData(user?.id as string);

  // Get current and previous month revenues
  const currentMonthRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousMonthRevenue = chartData[chartData.length - 2]?.revenue || 0;

  // Calculate percentage change
  let percentageChange = 0;
  if (previousMonthRevenue === 0 && currentMonthRevenue > 0) {
    percentageChange = 100;
  } else if (previousMonthRevenue > 0) {
    percentageChange =
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
      100;
  }

  const isTrendingUp = percentageChange >= 0;

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>
          Track your revenue performance for the past 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.every((item) => item.revenue === 0) ? (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-gray-500 text-center">
              No revenue data available for the last 6 months.
            </p>
          </div>
        ) : (
          <MonthlyRevenueChart chartData={chartData} />
        )}
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div
          className={`flex gap-2 leading-none font-medium ${
            isTrendingUp ? "text-green-600" : "text-red-600"
          }`}
        >
          Trending {isTrendingUp ? "up" : "down"} by{" "}
          {Math.abs(percentageChange).toFixed(1)}% this month
          {isTrendingUp ? (
            <TrendingUp className="size-4" />
          ) : (
            <TrendingDown className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total revenue for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlyRevenueChartWrapper;
