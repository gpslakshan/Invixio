import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema } from "@/lib/schemas";
import { InvoiceFormData } from "@/types";

export const useInvoiceForm = () => {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyAddress: "",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: "",
      invoiceDate: new Date(),
      items: [],
      tax: 0,
      discount: 0,
      paymentInstructions: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTax = form.watch("tax");
  const watchedDiscount = form.watch("discount");

  const subtotal = watchedItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0
  );

  const total = subtotal + (watchedTax || 0) - (watchedDiscount || 0);

  const handleAddItem = () => {
    append({
      description: "",
      quantity: 1,
      rate: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  return {
    form,
    fields,
    watchedItems,
    watchedTax,
    watchedDiscount,
    subtotal,
    total,
    handleAddItem,
    handleRemoveItem,
  };
};
