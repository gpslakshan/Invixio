"use server";

import { prisma } from "@/lib/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

export async function syncUserToDatabase(
  user: KindeUser<Record<string, string>>
) {
  try {
    console.log("starting to sync user to DB.");
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser) {
      console.log("creating the new user: ", user.email);
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          imageUrl: user.picture || "",
        },
      });
    } else {
      console.log("updating the user: ", user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email!,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          imageUrl: user.picture || "",
        },
      });
    }

    console.log("user synced to the DB successfully.");
    return {
      status: "success",
      message: "user synced to the DB successfully.",
    };
  } catch (error) {
    console.error("something went wrong", error);
    return { status: "error", message: "something went wrong!" };
  }
}
