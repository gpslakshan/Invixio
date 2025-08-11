"use client";

import { getColumns } from "@/app/dashboard/invoices/columns";
import { DataTable } from "@/app/dashboard/invoices/data-table";
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
