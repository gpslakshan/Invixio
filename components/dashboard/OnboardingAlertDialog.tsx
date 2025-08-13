"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Building2, User2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { completeOnboardingProcess } from "@/app/actions/onboarding";
import { onboardingSchema } from "@/lib/schemas";
import CurrencyPicker from "@/components/shared/CurrencyPicker";
import { OnboardingFormData } from "@/types";

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

interface Props {
  isOpen: boolean;
}

const OnboardingAlertDialog = ({ isOpen }: Props) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(isOpen);
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedBusinessType = form.watch("businessType");

  const onSubmit = async (data: OnboardingFormData) => {
    const result = await completeOnboardingProcess(data);
    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }

    setIsAlertDialogOpen(false);
  };

  return (
    <AlertDialog open={isAlertDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>👋 You&apos;re Almost There!</AlertDialogTitle>
        <AlertDialogDescription className="mb-2">
          Just a few more steps to complete your setup. This helps us tailor
          your invoicing experience.
        </AlertDialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" className="w-full mt-4">
              Continue
            </Button>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingAlertDialog;
