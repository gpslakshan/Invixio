"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InvoiceStatusItem } from "@/types/dashboard";
import {
  ResponsiveContainer,
  Pie,
  Cell,
  Tooltip,
  Legend,
  PieChart,
} from "recharts";

const COLORS: Record<string, string> = {
  Paid: "#22c55e",
  Unpaid: "#eab308",
  Overdue: "#ef4444",
};

export function InvoiceStatusBreakdownPieChart({
  data,
}: {
  data: InvoiceStatusItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS] ?? "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
