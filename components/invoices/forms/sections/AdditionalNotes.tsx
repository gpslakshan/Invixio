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

const AdditionalNotes = ({ form }: Props) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mt-2 text-lg font-semibold">
            Additional Notes
          </FormLabel>
          <FormControl>
            <Textarea
              rows={4}
              {...field}
              placeholder="Ex: Thank you for your business! For any questions, please contact us at billing@acmecorp.com."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AdditionalNotes;
