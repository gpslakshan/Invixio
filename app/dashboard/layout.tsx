import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser, getUserOnboardingStatus } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const { needsOnboarding } = await getUserOnboardingStatus(user);
  if (needsOnboarding) {
    return redirect("/onboarding");
  }

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="p-4 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
