"use client";

import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { links } from "./Sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
      <SheetContent side="left">
        <SheetTitle className="sr-only">menu</SheetTitle>
        <nav className="mt-12">
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
      </SheetContent>
    </Sheet>
  );
}
