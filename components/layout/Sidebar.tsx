"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Logo from "@/public/logo.svg";

export const links = [
  { id: 0, href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { id: 1, href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { id: 2, href: "/dashboard/clients", label: "Clients", icon: Users },
];

export function Sidebar() {
  const pathName = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathName === "/dashboard";
    return pathName.startsWith(href);
  };

  return (
    <div className="hidden lg:block border-r bg-muted/40">
      <div className="flex flex-col max-h-screen h-full gap-2">
        <div className="h-14 lg:h-[60px] flex items-center border-b px-4 lg:px-6">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2"
          >
            <Image src={Logo} alt="logo" width={28} height={28} />
            <p className="text-2xl font-bold">
              <span className="text-violet-600">Inv</span>
              oxie
            </p>
          </Link>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col items-start px-2 lg:px-4 text-sm font-medium">
            {links.map((link) => (
              <li key={link.id} className="w-full">
                <Link
                  href={link.href}
                  className={cn(
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground",
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
                  )}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
