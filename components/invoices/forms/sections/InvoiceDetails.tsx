"use client";

import { UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { InvoiceFormData } from "@/types";

interface Props {
  form: UseFormReturn<InvoiceFormData>;
}

const InvoiceDetails = ({ form }: Props) => {
  return (
    <div className="space-y-4 w-full md:w-1/2">
      <h2 className="text-lg font-semibold">Invoice Details</h2>
      <FormField
        control={form.control}
        name="invoiceNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Number</FormLabel>
            <FormControl>
              <Input placeholder="INV0001" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="invoiceDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Issue Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild disabled>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={new Date(field.value)}
                  onSelect={field.onChange}
                  disabled={true}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="dueDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={new Date(field.value)}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default InvoiceDetails;
