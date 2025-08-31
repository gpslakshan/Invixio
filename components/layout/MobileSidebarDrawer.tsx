"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { links } from "./Sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.svg";
import InvoiceUsage from "../shared/InvoiceUsage";

export function MobileSidebarDrawer() {
  const pathName = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathName === "/dashboard";
    return pathName.startsWith(href);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="max-w-[280px]">
        <SheetTitle className="sr-only">menu</SheetTitle>
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

        <div className="h-full flex flex-col justify-between">
          <nav>
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

          <div className="px-2 py-4">
            <InvoiceUsage />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
