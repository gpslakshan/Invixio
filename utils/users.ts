// // Important - If the following utility functions are called from server components, you don't need "use server". The directive is only needed for server actions that are called from client-side code.

import { prisma } from "@/lib/prisma";

export async function fetchUserCurrency(userId?: string): Promise<string> {
  if (!userId) {
    return "USD";
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true }, // Only fetch what you need
  });

  return user?.currency || "USD";
}

// You can add other user-related functions here too
export async function fetchUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}
