"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  Check,
  ChevronsUpDown,
  User2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { currencies } from "@/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { completeOnboardingProcess } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { onboardingSchema } from "@/lib/schemas";

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
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedBusinessType = form.watch("businessType");

  const onSubmit = async (data: z.infer<typeof onboardingSchema>) => {
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
        <AlertDialogTitle>👋 Welcome! Let’s get to know you</AlertDialogTitle>
        <AlertDialogDescription className="mb-4">
          This helps us tailor your invoicing experience.
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

            {/* Currency as a combobox in Shadcn */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred currency</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? `${
                                currencies.find(
                                  (currency) => currency.code === field.value
                                )?.flag
                              } - ${
                                currencies.find(
                                  (currency) => currency.code === field.value
                                )?.name
                              }`
                            : "Select Currency"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search Currency Code..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No currency found.</CommandEmpty>
                          <CommandGroup>
                            {currencies.map((currency) => (
                              <CommandItem
                                value={currency.code}
                                key={currency.code}
                                onSelect={() => {
                                  form.setValue("currency", currency.code);
                                }}
                              >
                                {currency.flag} - {currency.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    currency.code === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    You can always change this later in settings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OnboardingAlertDialog;
