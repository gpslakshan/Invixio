"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyInfoFormData, UserProfile } from "@/types";
import { companyInfoSchema } from "@/lib/schemas";
import { updateCompanyInformation } from "@/app/actions/settings";
import { toast } from "sonner";

const UpdateCompanyInformationForm = ({
  profile,
}: {
  profile: UserProfile;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: profile.companyName,
      companyEmail: profile.companyEmail,
      companyAddress: profile.companyAddress,
    },
  });

  const onSubmit = async (data: CompanyInfoFormData) => {
    setIsSubmitting(true);

    const result = await updateCompanyInformation(data);
    if (result.status === "error") {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }

    setIsSubmitting(false);
  };

  return (
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

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Please wait.." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

export default UpdateCompanyInformationForm;
