"use client";

import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

// const chartData = [
//   { month: "Mar", revenue: 5200 },
//   { month: "Apr", revenue: 5000 },
//   { month: "May", revenue: 5500 },
//   { month: "Jun", revenue: 6100 },
//   { month: "Jul", revenue: 5800 },
//   { month: "Aug", revenue: 6000 },
// ];

interface Props {
  chartData: {
    month: string;
    revenue: number;
  }[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const MonthlyRevenueChart = ({ chartData }: Props) => {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="revenue" fill="var(--color-primary)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
};

export default MonthlyRevenueChart;
