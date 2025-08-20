import { z } from "zod";
import { getTodayDate } from "./utils";

export const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyEmail: z.string().email("Please enter a valid email"),
  companyAddress: z.string().min(1, "Company address is required"),
  businessType: z.enum(["freelancer", "small_business", "other"], {
    error: () => ({ message: "Please tell us about your business." }),
  }),
  currency: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? "Please choose a preferred currency."
          : "Invalid input.",
    })
    .min(1, "Please choose a preferred currency."),
});

// Zod schema for create invoice form validation
export const invoiceSchema = z.object({
  // Company information
  companyName: z.string().min(1, "Company name is required"),
  companyEmail: z.string().email("Please enter a valid email"),
  companyAddress: z.string().min(1, "Company address is required"),

  // Client information
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Please enter a valid client email"),
  clientAddress: z.string().min(1, "Client address is required"),

  // Invoice details
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Invoice number can only contain letters and numbers"
    ),
  invoiceDate: z.date().refine(
    (date) => {
      const today = getTodayDate();
      const inputDate = new Date(date);
      inputDate.setUTCHours(0, 0, 0, 0); // Set input date to midnight UTC for comparison

      // Compare the two dates
      return inputDate.getTime() === today.getTime();
    },
    {
      message: "Invoice date must be today's date.",
    }
  ),
  dueDate: z
    .date({
      error: (issue) =>
        issue.input === undefined ? "Due date is required" : "Invalid date",
    })
    .min(new Date(), { error: "Too old!" }),

  // Invoice items
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        rate: z.number().min(0, "Unit price must be 0 or greater"),
      })
    )
    .min(1, "At least one item is required"),

  // Financial details
  tax: z.number().min(0, "Tax must be 0 or greater"),
  discount: z.number().min(0, "Discount must be 0 or greater"),

  paymentInstructions: z
    .string()
    .min(1, "Payment instructions are required")
    .max(500, "Payment instructions can be maximum of 500 characters"),

  // Additional notes
  notes: z
    .string()
    .max(500, "Notes can be maximum of 500 characters")
    .optional(),
});
