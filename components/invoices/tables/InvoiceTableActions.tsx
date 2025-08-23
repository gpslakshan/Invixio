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
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { InvoiceDataTableItem } from "@/types";
import {
  deleteInvoice,
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
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsDownloading(true);

    const result = await downloadInvoice(invoiceId);
    if (result.status === "success") {
      const invoiceUrl = result.data;
      window.open(invoiceUrl, "_blank"); // Open the URL in a new browser tab.
    } else {
      toast.error(result.message);
    }

    setIsDownloading(false);
    setIsMenuOpen(false); // <-- close dropdown AFTER download completes
  };

  const handleReminderEmail = async (invoiceId: string) => {
    const result = await sendReminderEmail(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setIsDeletingInvoice(true);

    const result = await deleteInvoice(invoiceId);
    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    setIsDeletingInvoice(false);
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {!isPaid && (
            <DropdownMenuItem asChild disabled={invoice.status === "PAID"}>
              <Link href={`/dashboard/invoices/${invoice.id}`}>
                <FileEdit className="mr-2 size-4" />
                Edit invoice
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            onClick={() => handleDownloadInvoice(invoice.id)}
            disabled={isDownloading}
          >
            <Download className="mr-2 size-4" />
            {isDownloading ? "Downloading..." : "Download invoice"}
          </DropdownMenuItem>

          {!isPaid && (
            <DropdownMenuItem
              onClick={() => handleReminderEmail(invoice.id)}
              disabled={invoice.status === "PAID"}
            >
              <MailWarning className="mr-2 size-4" />
              Reminder email
            </DropdownMenuItem>
          )}

          {/* Conditional action based on invoice status */}
          {isPaid ? (
            <DropdownMenuItem onClick={() => handleMarkAsUnpaid(invoice.id)}>
              <Undo2 className="mr-2 size-4" />
              Mark as unpaid
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
              <CircleDollarSign className="mr-2 size-4" />
              Mark as paid
            </DropdownMenuItem>
          )}

          {!isPaid && <DropdownMenuSeparator />}

          {!isPaid && (
            <DropdownMenuItem
              onClick={() => setIsAlertDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
              disabled={invoice.status === "PAID"}
            >
              <Trash className="mr-2 size-4 text-red-600 focus:text-red-600" />
              Delete invoice
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isAlertDialogOpen || isDeletingInvoice}
        onOpenChange={setIsAlertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this invoice?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the invoice and cannot be
              reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteInvoice(invoice.id)}
              disabled={isDeletingInvoice}
            >
              {isDeletingInvoice ? "Please wait..." : "Delete Invoice"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoiceTableActions;
