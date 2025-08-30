import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { fetchUserProfile } from "@/lib/utils";
import ThemeSelect from "./_components/ThemeSelect";
import UpdateCompanyInformationForm from "./_components/UpdateCompanyInformationForm";
import { currencies } from "@/constants";

export default async function SettingsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user?.id) return <p className="p-8">User not found</p>;

  const profile = await fetchUserProfile(user.id);
  if (!profile) return <p className="p-8">Profile not found</p>;

  const currency = currencies.find(
    (currency) => currency.code === profile.currency
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your preferences and company information
        </p>

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Choose your preferred dashboard theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelect />
          </CardContent>
        </Card>

        {/* Currency (read-only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preferred Currency</CardTitle>
            <CardDescription>
              Your selected currency during onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-sm">
              {currency?.flag} - {currency?.code} ({currency?.name})
            </p>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details below</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateCompanyInformationForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
