import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InvoiceSummaryItem } from "@/types/dashboard";

export function InvoiceSummaryCard({ item }: { item: InvoiceSummaryItem }) {
  return (
    <Card key={item.title}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
        {item.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{item.value}</div>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
      </CardContent>
    </Card>
  );
}
