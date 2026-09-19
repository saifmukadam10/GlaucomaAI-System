import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ResultsCard } from "@/components/ResultsCard";
import { HowItWorks } from "@/components/HowItWorks";
import { BenefitsSection } from "@/components/BenefitsSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-manrope">
      <Header />
      <main>
        <HeroSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
