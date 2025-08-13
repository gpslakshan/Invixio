"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { getCurrencySymbol } from "@/lib/utils";
import { InvoiceFormData } from "@/types";

interface Props {
  form: UseFormReturn<InvoiceFormData>;
  subtotal: number;
  total: number;
  currency: string;
}

const InvoiceSummary = ({ form, subtotal, total, currency }: Props) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2">
      <div></div>
      <div className="space-y-2 w-full md:w-2/3 ml-auto">
        <div className="flex justify-between">
          <span className="text-sm text-gray-700">Subtotal</span>
          <span className="font-medium">
            {getCurrencySymbol(currency)} {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Tax ({getCurrencySymbol(currency)})
          </span>
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-24 text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Discount ({getCurrencySymbol(currency)})
          </span>
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-24 text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>
            {getCurrencySymbol(currency)} {total.toFixed(2)}
          </span>
        </div>
        <hr className="mt-2 border-t-2" />
        <hr className="border-t-2" />
      </div>
    </div>
  );
};

export default InvoiceSummary;
