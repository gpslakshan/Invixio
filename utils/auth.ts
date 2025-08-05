// Important - If the following utility functions are called from server components, you don't need "use server". The directive is only needed for server actions that are called from client-side code.

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getCurrentUser() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  return user;
}
