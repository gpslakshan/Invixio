import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema } from "@/lib/schemas";
import { InvoiceData, InvoiceFormData, UserProfile } from "@/types";

export const useInvoiceForm = (
  profile: UserProfile,
  initialData?: InvoiceData
) => {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: initialData?.companyName || profile.companyName || "",
      companyEmail: initialData?.companyEmail || profile.companyEmail || "",
      companyAddress:
        initialData?.companyAddress || profile.companyAddress || "",
      clientName: initialData?.clientName || "",
      clientEmail: initialData?.clientEmail || "",
      clientAddress: initialData?.clientAddress || "",
      invoiceNumber: initialData?.invoiceNumber || "",
      invoiceDate: initialData?.invoiceDate || new Date(),
      dueDate: initialData?.dueDate,
      items: initialData?.items || [],
      taxPercentage: initialData?.taxPercentage || 0,
      discountPercentage: initialData?.discountPercentage || 0,
      paymentInstructions: initialData?.paymentInstructions || "",
      notes: initialData?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTaxPercentage = form.watch("taxPercentage");
  const watchedDiscountPercentage = form.watch("discountPercentage");

  const subtotal = Number(
    watchedItems
      .reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0)
      .toFixed(2)
  );

  const tax = Number((subtotal * (watchedTaxPercentage / 100)).toFixed(2));
  const discount = Number(
    (subtotal * (watchedDiscountPercentage / 100)).toFixed(2)
  );

  const total = subtotal + (tax || 0) - (discount || 0);

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
    tax,
    discount,
    subtotal,
    total,
    handleAddItem,
    handleRemoveItem,
  };
};
