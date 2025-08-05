"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { formSchema } from "@/lib/schemas/onboarding";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/utils/auth";

export async function completeOnboardingProcess(
  data: z.infer<typeof formSchema>
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { status: "error", message: "Unauthorized" };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hasOnboarded: true,
        businessType: data.businessType,
        currency: data.currency,
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
