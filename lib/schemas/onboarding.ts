import { z } from "zod";

export const formSchema = z.object({
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
