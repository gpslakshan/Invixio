"use client";

import { getColumns } from "@/app/dashboard/invoices/columns";
import { DataTable } from "@/app/dashboard/invoices/data-table";
import { InvoiceDataTableItem } from "@/types";

export function InvoiceTable({
  invoices,
  currency,
}: {
  invoices: InvoiceDataTableItem[];
  currency: string;
}) {
  return <DataTable columns={getColumns(currency)} data={invoices} />;
}
