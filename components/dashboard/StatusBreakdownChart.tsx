"use client";

import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Pie, PieChart } from "recharts";

// const chartData = [
//   { status: "paid", count: 6, fill: "var(--color-paid)" },
//   { status: "pending", count: 3, fill: "var(--color-pending)" },
//   { status: "overdue", count: 2, fill: "var(--color-overdue)" },
// ];

interface Props {
  chartData: {
    status: string;
    count: number;
    fill: string;
  }[];
}

const chartConfig = {
  count: {
    label: "Count",
  },
  paid: {
    label: "PAID",
    color: "var(--chart-1)",
  },
  pending: {
    label: "PENDING",
    color: "var(--chart-2)",
  },
  overdue: {
    label: "OVERDUE",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const StatusBreakdownChart = ({ chartData }: Props) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] md:max-h-[350px] xl:max-h-[500px]"
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="status" hideLabel />}
        />
        <Pie data={chartData} dataKey="count" />
        <ChartLegend
          content={<ChartLegendContent nameKey="status" />}
          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
};

export default StatusBreakdownChart;
