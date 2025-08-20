import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <Navbar />
      <main className="min-h-screen flex flex-col justify-center items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
