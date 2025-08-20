"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { onboardingSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/utils";
import { OnboardingFormData } from "@/types";

export async function completeOnboardingProcess(formData: OnboardingFormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to complete the onboarding process",
      };
    }

    const validatedData = onboardingSchema.safeParse(formData);

    if (!validatedData.success) {
      return {
        status: "error",
        message: "Invalid form data. Please check your inputs.",
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hasOnboarded: true,
        businessType: validatedData.data.businessType,
        currency: validatedData.data.currency,
        companyName: validatedData.data.companyName,
        companyEmail: validatedData.data.companyEmail,
        companyAddress: validatedData.data.companyAddress,
      },
    });

    return {
      status: "success",
      message: "Successfully completed the onboarding process.",
    };
  } catch (error) {
    console.log("an error occured in completeOnboardingProcess", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: "error",
        message: "Database error occurred!",
      };
    }

    return {
      status: "error",
      message: "Something went wrong!",
    };
  }
}
