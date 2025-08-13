"use client";

import { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getCurrencySymbol } from "@/lib/utils";
import { InvoiceFormData } from "@/types";

interface Props {
  form: UseFormReturn<InvoiceFormData>;
  fields: FieldArrayWithId<InvoiceFormData, "items", "id">[];
  watchedItems: {
    description: string;
    quantity: number;
    rate: number;
  }[];
  currency: string;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
}

const InvoiceItems = ({
  form,
  fields,
  watchedItems,
  currency,
  handleAddItem,
  handleRemoveItem,
}: Props) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Invoice Items</h2>
      {fields.length > 0 && (
        <div className="hidden md:grid grid-cols-6 gap-2 font-medium text-sm text-gray-600 mb-1">
          <div className="md:col-span-2">Description</div>
          <div className="md:col-span-1">Qty</div>
          <div className="md:col-span-1">
            Rate ({getCurrencySymbol(currency)})
          </div>
          <div className="md:col-span-1">Amount</div>
          <div className="md:col-span-1 text-center md:text-left"> </div>
        </div>
      )}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-start rounded-xl border bg-card text-card-foreground shadow 
            md:bg-transparent md:rounded-none md:border-0 md:shadow-none md:p-0"
          >
            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="md:hidden">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Item Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel className="md:hidden">Qty</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Qty"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.rate`}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel className="md:hidden">
                    Rate ({getCurrencySymbol(currency)})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Rate"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-1">
              <Label className="md:hidden mb-2">Amount</Label>
              <Input
                type="number"
                value={(
                  (watchedItems[index]?.quantity || 0) *
                  (watchedItems[index]?.rate || 0)
                ).toFixed(2)}
                disabled
              />
            </div>
            <div className="flex md:col-span-1">
              <Button
                type="button"
                variant="ghost"
                className="hidden md:block"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2Icon size={18} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full md:hidden"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2Icon /> Delete Item
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddItem}
        className="mt-2"
      >
        + Add Item
      </Button>
      {form.formState.errors.items && (
        <p className="text-sm font-medium text-destructive mt-2">
          {form.formState.errors.items.message}
        </p>
      )}
    </div>
  );
};

export default InvoiceItems;
