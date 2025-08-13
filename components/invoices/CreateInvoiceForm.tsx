"use client";

import React, { useEffect, useState } from "react";
import { CalendarIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  cn,
  deleteFromS3,
  generateInvoicePDF,
  getCurrencySymbol,
  handleLogoUpload,
} from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { createInvoice } from "@/app/actions/invoices";
import { useRouter } from "next/navigation";
import { invoiceSchema } from "@/lib/schemas";
import { InvoiceData, InvoiceFormData } from "@/types";
import InvoiceFormActions from "./InvoiceFormActions";
import InvoicePreview from "./InvoicePreview";

interface Props {
  currency: string;
}

const CreateInvoiceForm = ({ currency }: Props) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // S3 URL after upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sticky, setSticky] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      currency,
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed MIME types
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      toast.warning("Only PNG and JPEG images are allowed.");
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File size must be less than 5MB");
      return;
    }

    setLogoPreview(URL.createObjectURL(file));

    // Start upload process
    setUploadingLogo(true);

    try {
      const fileUrl = await handleLogoUpload(file);
      setLogoUrl(fileUrl); // Store the S3 URL
      console.log("Logo uploaded successfully:", fileUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo. Please try again.");
      setLogoPreview(null); // Reset on error
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

  const handlePreview = async () => {
    const data = form.getValues();

    setGeneratingPreview(true);

    try {
      const invoiceData: InvoiceData = {
        id: `INV${Date.now().toString()}`,
        status: "DRAFT",
        invoiceNumber: data.invoiceNumber || "INV-DRAFT",
        companyName: data.companyName || "Your Company",
        companyEmail: data.companyEmail || "your-email@company.com",
        companyAddress: data.companyAddress || "Your Company Address",
        clientName: data.clientName || "Client Name",
        clientEmail: data.clientEmail || "client@email.com",
        clientAddress: data.clientAddress || "Client Address",
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        subtotal,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total,
        notes: data.notes || "",
        logoUrl: logoUrl,
        items:
          data.items?.length > 0
            ? data.items.map((item) => ({
                description: item.description || "Sample Item",
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                amount: (item.quantity || 1) * (item.rate || 0),
              }))
            : [
                {
                  description: "Sample Item - Add items above",
                  quantity: 1,
                  rate: 0,
                  amount: 0,
                },
              ],
        paymentInstructions:
          data.paymentInstructions || "Payment instructions will appear here",
      };

      const pdfBuffer = await generateInvoicePDF(invoiceData);

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create a Blob from the ArrayBuffer buffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      toast.error("Failed to generate invoice preview");
      console.error(error);
    } finally {
      setGeneratingPreview(false);
    }
  };

  // Function to close preview and clean up
  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleDownloadPDF = async () => {
    // Validate form before submitting
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix form errors before downloading");
      return;
    }

    const data = form.getValues();

    setDownloadingPDF(true);

    try {
      const invoiceData: InvoiceData = {
        id: `INV${Date.now().toString()}`,
        status: "DRAFT",
        invoiceNumber: data.invoiceNumber,
        companyName: data.companyName,
        companyEmail: data.companyEmail,
        companyAddress: data.companyAddress,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        subtotal,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total,
        notes: data.notes,
        logoUrl: logoUrl,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
        paymentInstructions: data.paymentInstructions,
      };

      const pdfBuffer = await generateInvoicePDF(invoiceData);
      const filename = "invoice.pdf";

      // Create a Blob from the ArrayBuffer buffer
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });

      // Create an object URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      // Append the link to the document and trigger a click
      document.body.appendChild(a);
      a.click();

      // Remove the link and revoke the URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download invoice PDF");
      console.error(error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    // Validate form before submitting
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix form errors before sending");
      return;
    }

    setSubmittingForm(true);
    const data = form.getValues();

    try {
      const result = await createInvoice(data, logoUrl);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.status === "warning") {
        toast.warning(result.message, { duration: 7000 });
        setIsNavigating(true); // Show navigation loading
        router.push("/dashboard/invoices"); // // router.push() is non-blocking - it initiates navigation but doesn't wait. The finally block executes immediately: setSubmittingForm(false)
      } else {
        toast.success(result.message, { duration: 7000 });
        setIsNavigating(true); // Show navigation loading
        router.push("/dashboard/invoices"); // router.push() is non-blocking - it initiates navigation but doesn't wait. The finally block executes immediately: setSubmittingForm(false)
      }
    } catch (error) {
      toast.error("Failed to send invoice");
      console.error(error);
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <InvoiceFormActions
        isUploadingLogo={uploadingLogo}
        isDeletingLogo={deletingLogo}
        isSubmittingForm={submittingForm || isNavigating} // Disabled during both
        isDownloadingPDF={downloadingPDF}
        isGeneratingPreview={generatingPreview}
        onPreview={handlePreview}
        onDownloadPDF={handleDownloadPDF}
        onSendEmail={handleSendEmail}
        isSticky={sticky}
      />
      <div className="p-6 space-y-6 border bg-white shadow">
        <Form {...form}>
          <form className="space-y-6">
            {/* Top Section: Issuer Details and Logo */}
            <div className="flex flex-col md:flex-row justify-between items-stretch flex-grow gap-6">
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
              <div className="w-full md:w-1/2">
                <div className="flex h-full justify-center items-center">
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
                          accept="image/png, image/jpeg"
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

            {/* Middle Section: Client Details and Invoice Details */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
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
            </div>

            {/* Invoice Items */}
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
                  <div className="md:col-span-1 text-center md:text-left">
                    {" "}
                  </div>
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
                          <FormLabel className="md:hidden">
                            Description
                          </FormLabel>
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
                      {/* Tabs and Desktop Delete button */}
                      <Button
                        type="button"
                        variant="ghost"
                        className="hidden md:block"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2Icon size={18} />
                      </Button>

                      {/* Mobile Delete button */}
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

            {/* Summary Section */}
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
                    {getCurrencySymbol(currency)} {total.toFixed(2)}
                  </span>
                </div>
                <hr className="mt-2 border-t-2" />
                <hr className="border-t-2" />
              </div>
            </div>

            {/* Payment Instructions */}
            <FormField
              control={form.control}
              name="paymentInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-6 text-lg font-semibold">
                    Payment Instructions:
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      {...field}
                      placeholder={`Ex: Please make checks payable to Acme Corportation Ltd. or pay via bank transfer:
Bank Name: Cityville Bank
Account Name: Acme Corportation Ltd.
Account No: 123456789
Routing No: 987654321
Payment is due within 14 days of the invoice date.`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mt-2 text-lg font-semibold">
                    Notes
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
          </form>
        </Form>
      </div>

      {previewOpen && (
        <InvoicePreview
          previewUrl={previewUrl}
          closePreview={closePreview}
          handleDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default CreateInvoiceForm;
