"use client";

import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "../ui/button";
import { redirect } from "next/navigation";

export function Navbar() {
  const { getUser } = useKindeBrowserClient();
  const user = getUser();

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <nav className="py-5 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Invixio Logo" width={32} height={32} />
          <h2 className="text-2xl font-bold">
            <span className="text-violet-500">Inv</span>
            oxie
          </h2>
        </div>
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <LogoutLink className={buttonVariants({ variant: "secondary" })}>
            Logout
          </LogoutLink>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <LoginLink className={buttonVariants()}>Login</LoginLink>
          <RegisterLink className={buttonVariants({ variant: "secondary" })}>
            Register
          </RegisterLink>
        </div>
      )}
    </nav>
  );
}
