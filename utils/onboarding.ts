import { prisma } from "@/lib/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

export async function getUserOnboardingStatus(
  user: KindeUser<Record<string, string>>
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const needsOnboarding = !existingUser?.hasOnboarded;
    return { status: "success", needsOnboarding };
  } catch (error) {
    console.log("an error occured while fetching the user.", error);
    return { status: "error", needsOnboarding: false };
  }
}
