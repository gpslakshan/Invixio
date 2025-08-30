import {
  getKindeServerSession,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  // Get user session from Kinde
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="mb-6">View and manage your account information.</p>

      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            These details are managed by Kinde Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={user?.picture ?? ""}
              alt={user?.given_name ?? "U"}
            />
            <AvatarFallback>{user?.given_name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {user?.given_name} {user?.family_name}
            </h2>
            <p className="text-gray-600">{user?.email}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <p className="text-sm text-gray-500 overflow-hidden">User ID</p>
                <p className="font-mono text-sm break-all">{user?.id}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-mono text-sm">{formatDate(new Date())}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <LogoutLink className={buttonVariants({ variant: "destructive" })}>
            <LogOut size={18} />
            Logout
          </LogoutLink>
        </CardContent>
      </Card>
    </div>
  );
}
