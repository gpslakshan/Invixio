import { Features } from "@/components/features/marketing/Features";
import { Hero } from "@/components/features/marketing/Hero";
import { Pricing } from "@/components/features/marketing/Pricing";
import { Navbar } from "@/components/layout/Navbar";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col max-w-7xl mx-auto px-4">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
    </main>
  );
}
