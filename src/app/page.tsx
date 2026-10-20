import { CtaBand } from "@/components/site/CtaBand";
import { Faq } from "@/components/site/Faq";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Manifesto } from "@/components/site/Manifesto";
import { Nav } from "@/components/site/Nav";
import { Payouts } from "@/components/site/Payouts";
import { Plans } from "@/components/site/Plans";
import { Rules } from "@/components/site/Rules";
import { Stats } from "@/components/site/Stats";
import { Ticker } from "@/components/site/Ticker";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Ticker />
      <Stats />
      <Manifesto />
      <HowItWorks />
      <Plans />
      <Rules />
      <Payouts />
      <Faq />
      <CtaBand />
      <Footer />
    </main>
  );
}
