import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser, getUserOnboardingStatus } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import OnboardingAlertDialog from "@/components/dashboard/OnboardingAlertDialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  let isAlertDialogOpened = false;

  if (user) {
    // await syncUserToDatabase(user);
    const { needsOnboarding } = await getUserOnboardingStatus(user);
    isAlertDialogOpened = needsOnboarding;
  } // we don't need to check for the "user" is not existing scenario here because "middleware.ts" file is already making sure we can't access dashboard routes if the user is not logged in

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-[280px_1fr]">
      <OnboardingAlertDialog isOpen={isAlertDialogOpened} />
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="p-4 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
