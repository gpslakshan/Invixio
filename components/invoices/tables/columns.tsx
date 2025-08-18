"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyWithSymbol, formatDate } from "@/lib/utils";
import { InvoiceDataTableItem } from "@/types";
import InvoiceTableActions from "./InvoiceTableActions";

export const getColumns = (
  currency: string
): ColumnDef<InvoiceDataTableItem>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice No.",
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"));
      const formatted = formatCurrencyWithSymbol(total, currency);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");

      const statusColors: Record<string, string> = {
        DRAFT: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        PAID: "bg-green-100 text-green-800 hover:bg-green-200",
        CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
      };

      return (
        <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const invoiceDate: Date = row.getValue("invoiceDate");
      const formatted = formatDate(invoiceDate);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;

      return <InvoiceTableActions invoice={invoice} />;
    },
  },
];
