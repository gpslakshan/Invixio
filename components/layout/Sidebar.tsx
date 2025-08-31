"use client";

import Link from "next/link";
import Image from "next/image";
import { CreditCard, FileText, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Logo from "@/public/logo.svg";
import InvoiceUsage from "../shared/InvoiceUsage";

export const links = [
  { id: 0, href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { id: 1, href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { id: 2, href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { id: 3, href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathName = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathName === "/dashboard";
    return pathName.startsWith(href);
  };

  return (
    <aside className="hidden lg:block sticky top-0 h-svh w-[280px] border-r bg-muted/40">
      {/* 3 rows: header | scrollable nav | bottom widget */}
      <div className="h-full grid grid-rows-[auto_1fr_auto]">
        {/* Logo / header */}
        <div className="h-14 lg:h-[60px] flex items-center border-b px-4 lg:px-6">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2"
          >
            <Image src={Logo} alt="logo" width={28} height={28} />
            <p className="text-2xl font-bold">
              <span className="text-violet-600">Inv</span>
              ixio
            </p>
          </Link>
        </div>

        {/* Scrollable nav area */}
        <div className="overflow-y-auto">
          <nav className="mt-4">
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

        {/* Pinned bottom */}
        <div className="px-2 py-2">
          <InvoiceUsage />
        </div>
      </div>
    </aside>
  );
}
