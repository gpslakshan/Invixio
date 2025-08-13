"use client";

import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InvoiceFormData } from "@/types";

interface Props {
  form: UseFormReturn<InvoiceFormData>;
}

const PaymentInstructions = ({ form }: Props) => {
  return (
    <FormField
      control={form.control}
      name="paymentInstructions"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mt-6 text-lg font-semibold">
            Payment Instructions
          </FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              {...field}
              placeholder={`Ex: Please make checks payable to Acme Corporation Ltd. or pay via bank transfer:
Bank Name: Cityville Bank
Account Name: Acme Corporation Ltd.
Account No: 123456789
Routing No: 987654321
Payment is due within 14 days of the invoice date.`}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PaymentInstructions;
