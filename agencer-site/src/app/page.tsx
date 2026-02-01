import { Hero } from "@/components/sections/Hero";
import { TheProblem } from "@/components/sections/TheProblem";
import { TheSolution } from "@/components/sections/TheSolution";
import { OrchestraVideo } from "@/components/sections/OrchestraVideo";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ConnectsToAnything } from "@/components/sections/ConnectsToAnything";
import { TotalRecall } from "@/components/sections/TotalRecall";
import { VoiceFirst } from "@/components/sections/VoiceFirst";
import { Security } from "@/components/sections/Security";
import { Pricing } from "@/components/sections/Pricing";
import { Founder } from "@/components/sections/Founder";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <TheProblem />
      <TheSolution />
      <OrchestraVideo />
      <HowItWorks />
      <ConnectsToAnything />
      <TotalRecall />
      <VoiceFirst />
      <Security />
      <Pricing />
      <Founder />
      <FinalCTA />
    </>
  );
}
