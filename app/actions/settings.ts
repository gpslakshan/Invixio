"use server";

import { prisma } from "@/lib/db";
import { companyInfoSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/utils";
import { CompanyInfoFormData } from "@/types";

export async function updateCompanyInformation(formData: CompanyInfoFormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "error",
        message: "You must be logged in to update the company information",
      };
    }

    const validatedData = companyInfoSchema.safeParse(formData);

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
        companyName: validatedData.data.companyName,
        companyEmail: validatedData.data.companyEmail,
        companyAddress: validatedData.data.companyAddress,
      },
    });

    return {
      status: "success",
      message: "Successfully updated the company information.",
    };
  } catch (error) {
    console.error("an error occured in updateCompanyInformation", error);

    return {
      status: "error",
      message: "Something went wrong!",
    };
  }
}
