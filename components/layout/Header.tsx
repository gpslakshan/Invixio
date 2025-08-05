"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { UserAvatar } from "../shared/UserAvatar";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";

export function Header() {
  const { getUser, isLoading } = useKindeBrowserClient();
  const user = getUser();

  return (
    <header className="h-14 lg:h-[60px] flex items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
      {/* Visible only in mobile screens */}
      <MobileSidebarDrawer />

      <div className="flex-1 flex items-center justify-end">
        {!isLoading && <UserAvatar user={user!} />}
      </div>
    </header>
  );
}
