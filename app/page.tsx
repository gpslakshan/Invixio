import LandingPageFooter from "@/components/layout/LandingPageFooter";
import { Navbar } from "@/components/layout/Navbar";
import FAQs from "@/components/marketing/FAQs";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { Pricing } from "@/components/marketing/Pricing";

export default async function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col max-w-7xl mx-auto px-4">
        <Navbar />
        <Hero id="home" />
        <Features id="features" />
        <Pricing id="pricing" />
        <FAQs id="faqs" />
      </main>
      <LandingPageFooter />
    </>
  );
}
