"use client";

import React, { useState } from "react";
import { CalendarIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { invoiceSchema } from "@/lib/schemas/invoices";
import { InvoiceFormData } from "@/types/invoices";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { deleteFromS3, handleFileUpload } from "@/lib/file-upload";
import { toast } from "sonner";
import { createInvoice } from "@/app/actions/invoices";
import { useRouter } from "next/navigation";

interface Props {
  currency: string;
}

const CreateInvoiceForm = ({ currency }: Props) => {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // S3 URL after upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const router = useRouter();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyAddress: "",
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: `#INV_${uuidv4()}`,
      invoiceDate: new Date(),
      items: [],
      tax: 0,
      discount: 0,
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
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const total = subtotal + (watchedTax || 0) - (watchedDiscount || 0);

  const handleAddItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file");
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File size must be less than 5MB");
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));

    // Start upload process
    setUploadingLogo(true);

    try {
      const fileUrl = await handleFileUpload(file);
      setLogoUrl(fileUrl); // Store the S3 URL
      console.log("Logo uploaded successfully:", fileUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
      // Reset on error
      setLogo(null);
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    setDeletingLogo(true);

    try {
      // Delete from S3 if logoUrl exists
      if (logoUrl) {
        await deleteFromS3(logoUrl);
      }

      // Clean up preview URL to prevent memory leaks
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      // Reset states
      setLogo(null);
      setLogoPreview(null);
      setLogoUrl(null);
    } catch (error) {
      console.error("Error removing logo:", error);
      // Optionally show user-friendly error message
      toast.error("Failed to remove logo. Please try again.");
    } finally {
      setDeletingLogo(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    console.log("Invoice Data:", data);
    console.log("Logo File:", logo);
    console.log("Logo S3 URL:", logoUrl);
    setSubmittingForm(true);

    const result = await createInvoice(data, logoUrl);
    if (result.status === "error") {
      toast.error(result.message);
      setSubmittingForm(false);
    } else if (result.status === "warning") {
      toast.warning(result.message);
      setSubmittingForm(false);
      router.push("/dashboard/invoices");
    } else {
      toast.success(result.message);
      setSubmittingForm(false);
      router.push("/dashboard/invoices");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 border bg-white shadow rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Top Section: Your Company and Logo */}
          <div className="flex flex-col md:flex-row justify-between items-start flex-grow gap-6">
            <div className="space-y-4 w-full md:w-1/2">
              <h2 className="text-lg font-semibold">Your Company</h2>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
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
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
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
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex h-full justify-center md:justify-end items-center">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-400 relative overflow-hidden">
                  {logoPreview ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={logoPreview}
                        alt="Logo"
                        fill
                        className="object-cover rounded-full"
                      />
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                          <div className="text-white text-xs text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                            Uploading...
                          </div>
                        </div>
                      )}
                      {deletingLogo && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                          <div className="text-white text-xs text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                            Deleting...
                          </div>
                        </div>
                      )}
                      {!uploadingLogo && !deletingLogo && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full">
                          <button
                            type="button"
                            onClick={() => removeLogo()}
                            className="text-white text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded shadow"
                          >
                            Remove Logo
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <UploadCloudIcon size={24} />
                      <span className="text-xs text-center">Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                        disabled={uploadingLogo}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rest of your form remains the same */}
          {/* Middle Section: Bill To and Invoice Info */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
            <div className="space-y-4 w-full md:w-1/2">
              <Label className="text-lg font-semibold">Bill To</Label>
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Client Name" {...field} />
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
                    <FormControl>
                      <Input
                        placeholder="Client Email"
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
                    <FormControl>
                      <Input placeholder="Client Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 w-full md:w-1/2">
              <Label className="text-lg font-semibold">Invoice</Label>
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Invoice No." disabled />
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
                              <span>Invoice date</span>
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
                              <span>Due date</span>
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
          </div>

          {/* Invoice Items */}
          <div>
            <Label className="text-lg font-semibold mb-3">Invoice Items</Label>
            {fields.length > 0 && (
              <div className="hidden md:grid grid-cols-6 gap-2 font-medium text-sm text-gray-600 mb-1">
                <div className="col-span-2">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Unit Price</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-1 text-left"> </div>
              </div>
            )}
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormControl>
                          <Input placeholder="Description" {...field} />
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
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Qty"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Unit price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-1">
                    <Input
                      type="number"
                      value={(
                        (watchedItems[index]?.quantity || 0) *
                        (watchedItems[index]?.unitPrice || 0)
                      ).toFixed(2)}
                      disabled
                    />
                  </div>
                  <div className="flex md:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2Icon size={18} />
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

          {/* Summary Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2">
            <div></div>
            <div className="space-y-2 w-full md:w-2/3 ml-auto">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Subtotal</span>
                <span className="font-medium">
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tax</span>
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="w-24 text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Discount</span>
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                  {currency} {total.toFixed(2)}
                </span>
              </div>
              <hr className="mt-2 border-t-2" />
              <hr className="border-t-2" />
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <Button type="submit" disabled={uploadingLogo || deletingLogo}>
              {uploadingLogo
                ? "Uploading Logo..."
                : deletingLogo
                  ? "Removing Logo..."
                  : submittingForm
                    ? "Submitting..."
                    : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateInvoiceForm;
