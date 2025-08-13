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

const IssuerDetails = ({ form }: Props) => {
  return (
    <div className="space-y-4 w-full md:w-1/2">
      <h2 className="text-lg font-semibold">Issuer Details</h2>
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Corporation Ltd." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="companyEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Email</FormLabel>
            <FormControl>
              <Input
                placeholder="billing@acmecorp.com"
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
        name="companyAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Address</FormLabel>
            <FormControl>
              <Input
                placeholder="123 Innovation Street, Metropolis, NY 10001"
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

export default IssuerDetails;
