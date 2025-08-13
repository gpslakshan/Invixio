"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
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

const ClientDetails = ({ form }: Props) => {
  return (
    <div className="space-y-4 w-full md:w-1/2">
      <h2 className="text-lg font-semibold">Client Details</h2>
      <FormField
        control={form.control}
        name="clientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Name</FormLabel>
            <FormControl>
              <Input placeholder="Bright Solutions Ltd." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="clientEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Email</FormLabel>
            <FormControl>
              <Input
                placeholder="accounts@brightsolutions.com"
                type="email"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="clientAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Address</FormLabel>
            <FormControl>
              <Input
                placeholder="45 Oak Avenue, Springfield, IL 62701"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ClientDetails;
