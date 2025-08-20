"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Briefcase, Building2, User2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingFormData } from "@/types";
import { onboardingSchema } from "@/lib/schemas";
import { completeOnboardingProcess } from "../actions/onboarding";
import CurrencyPicker from "@/components/shared/CurrencyPicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const businessTypeOptions: {
  label: string;
  value: "freelancer" | "small_business" | "other";
  icon: React.ReactNode;
}[] = [
  {
    label: "Freelancer",
    value: "freelancer",
    icon: <User2 className="w-5 h-5 mr-2" />,
  },
  {
    label: "Small Business",
    value: "small_business",
    icon: <Building2 className="w-5 h-5 mr-2" />,
  },
  {
    label: "Other",
    value: "other",
    icon: <Briefcase className="w-5 h-5 mr-2" />,
  },
];

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyAddress: "",
    },
  });

  const selectedBusinessType = form.watch("businessType");

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);

    const result = await completeOnboardingProcess(data);
    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      router.push("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="w-full md:w-[500px]">
      <CardHeader>
        <CardTitle>👋 You&apos;re Almost There!</CardTitle>
        <CardDescription>
          Just a few more steps to complete your setup. This helps us tailor
          your invoicing experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation Ltd." {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your company name which will be displayed in the
                    invoice.
                  </FormDescription>
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
                  <FormDescription>
                    This is your company email which will be displayed in the
                    invoice.
                  </FormDescription>
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
                  <FormDescription>
                    This is your company address which will be displayed in the
                    invoice.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Type - Custom Card Radio */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Tell us about your business
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {businessTypeOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => form.setValue("businessType", option.value)}
                    className={cn(
                      "flex items-center justify-start border rounded-xl px-4 py-3 text-sm transition-all hover:border-primary",
                      selectedBusinessType === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-background"
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
              {form.formState.errors.businessType && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.businessType.message}
                </p>
              )}
            </div>

            <CurrencyPicker<OnboardingFormData>
              control={form.control}
              name="currency"
              description="This currency will be used for all invoices and reports. ⚠️ You won't be able to change it later."
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait.." : "Complete Onboarding"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
