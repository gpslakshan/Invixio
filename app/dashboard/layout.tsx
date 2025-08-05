import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/utils/auth";
import { syncUserToDatabase } from "../actions/user";
import { getUserOnboardingStatus } from "@/utils/onboarding";
import OnboardingAlertDialog from "@/components/features/dashboard/OnboardingAlertDialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  let isAlertDialogOpened = false;

  if (user) {
    await syncUserToDatabase(user);
    const { needsOnboarding } = await getUserOnboardingStatus(user);
    isAlertDialogOpened = needsOnboarding;
  } // we don't need to check for the "user" is not existing scenario here because "middleware.ts" file is already making sure we can't access dashboard routes if the user is not logged in

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-[280px_1fr]">
      <OnboardingAlertDialog isOpen={isAlertDialogOpened} />
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
