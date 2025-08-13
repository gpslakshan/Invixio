"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  FileEdit,
  Download,
  MailWarning,
  CircleDollarSign,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrencyWithSymbol, formatDate } from "@/lib/utils";
import { InvoiceDataTableItem } from "@/types";

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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => console.log("Edit invoice", invoice.id)}
              disabled={invoice.status === "PAID"}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Edit invoice
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Download invoice", invoice.id)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download invoice
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Send reminder", invoice.id)}
              disabled={invoice.status === "PAID"}
            >
              <MailWarning className="mr-2 h-4 w-4" />
              Reminder email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Mark as paid", invoice.id)}
              disabled={invoice.status === "PAID"}
            >
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Mark as paid
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("Delete invoice", invoice.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
