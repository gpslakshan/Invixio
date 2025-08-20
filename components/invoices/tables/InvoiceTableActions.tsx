"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  FileEdit,
  Download,
  MailWarning,
  CircleDollarSign,
  Undo2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import { InvoiceDataTableItem } from "@/types";
import {
  cancelInvoice,
  downloadInvoice,
  markInvoiceAsPaid,
  markInvoiceAsUnpaid,
  sendReminderEmail,
} from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  invoice: InvoiceDataTableItem;
}

const InvoiceTableActions = ({ invoice }: Props) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isCancellingInvoice, setCancellingInvoice] = useState(false);
  const isPaid = invoice.status === "PAID";

  const handleMarkAsPaid = async (invoiceId: string) => {
    const result = await markInvoiceAsPaid(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleMarkAsUnpaid = async (invoiceId: string) => {
    const result = await markInvoiceAsUnpaid(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    const result = await downloadInvoice(invoiceId);
    if (result.status === "success") {
      const invoiceUrl = result.data;
      window.open(invoiceUrl, "_blank"); // Open the URL in a new browser tab.
    } else {
      toast.error(result.message);
    }
  };

  const handleReminderEmail = async (invoiceId: string) => {
    const result = await sendReminderEmail(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    setCancellingInvoice(true);

    const result = await cancelInvoice(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    setCancellingInvoice(false);
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            asChild
            disabled={
              invoice.status === "PAID" || invoice.status === "CANCELLED"
            }
          >
            <Link href={`/dashboard/invoices/${invoice.id}`}>
              <FileEdit className="mr-2 size-4" />
              Edit invoice
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
            <Download className="mr-2 size-4" />
            Download invoice
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleReminderEmail(invoice.id)}
            disabled={
              invoice.status === "PAID" || invoice.status === "CANCELLED"
            }
          >
            <MailWarning className="mr-2 size-4" />
            Reminder email
          </DropdownMenuItem>

          {/* Conditional action based on invoice status */}
          {isPaid ? (
            <DropdownMenuItem onClick={() => handleMarkAsUnpaid(invoice.id)}>
              <Undo2 className="mr-2 size-4" />
              Mark as unpaid
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleMarkAsPaid(invoice.id)}
              disabled={invoice.status === "CANCELLED"}
            >
              <CircleDollarSign className="mr-2 size-4" />
              Mark as paid
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsAlertDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
            disabled={
              invoice.status === "PAID" || invoice.status === "CANCELLED"
            }
          >
            <Ban className="mr-2 size-4 text-red-600 focus:text-red-600" />
            Cancel invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isAlertDialogOpen || isCancellingInvoice}
        onOpenChange={setIsAlertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel this invoice?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently cancel the invoice and cannot be
              reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleCancelInvoice(invoice.id)}
              disabled={isCancellingInvoice}
            >
              {isCancellingInvoice ? "Please wait..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoiceTableActions;
