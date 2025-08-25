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
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

const InvoiceSummary = ({
  form,
  subtotal,
  tax,
  discount,
  total,
  currency,
}: Props) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2 w-full md:col-span-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-700">Tax %</span>
          <FormField
            control={form.control}
            name="taxPercentage"
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-700">Discount %</span>
          <FormField
            control={form.control}
            name="discountPercentage"
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
      </div>
      <div className="md:col-span-1"></div>
      <div className="space-y-2 w-full md:col-span-1">
        <div className="flex items-center justify-end gap-6">
          <span className="text-sm text-gray-700">Subtotal</span>
          <span className="font-medium">
            {getCurrencySymbol(currency)} {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-6">
          <span className="text-sm text-gray-700">Tax</span>
          <span className="font-medium">
            {getCurrencySymbol(currency)} {tax.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-6">
          <span className="text-sm text-gray-700">Discount</span>
          <span className="font-medium">
            {getCurrencySymbol(currency)} {discount.toFixed(2)}
          </span>
        </div>
        <hr className="my-2" />
        <div className="flex items-center justify-end gap-6 font-semibold text-lg">
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
