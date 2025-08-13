"use client";

import { getColumns } from "@/components/invoices/tables/columns";
import { DataTable } from "@/components/invoices/tables/data-table";
import { InvoiceDataTableItem } from "@/types";
import React from "react";

interface Props {
  invoices: InvoiceDataTableItem[];
  currency: string;
}

const InvoiceTable = ({ currency, invoices }: Props) => {
  return <DataTable columns={getColumns(currency)} data={invoices} />;
};

export default InvoiceTable;
