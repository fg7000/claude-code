import { Hero } from "@/components/sections/Hero";
import { TheProblem } from "@/components/sections/TheProblem";
import { TheSolution } from "@/components/sections/TheSolution";
import { OrchestraVideo } from "@/components/sections/OrchestraVideo";
import { CostAdvantage } from "@/components/sections/CostAdvantage";
import { ConnectsToAnything } from "@/components/sections/ConnectsToAnything";
import { TotalRecall } from "@/components/sections/TotalRecall";
import { VoiceFirst } from "@/components/sections/VoiceFirst";
import { Security } from "@/components/sections/Security";
import { Network } from "@/components/sections/Network";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <TheProblem />
      <TheSolution />
      <OrchestraVideo />
      <CostAdvantage />
      <ConnectsToAnything />
      <TotalRecall />
      <VoiceFirst />
      <Security />
      <Network />
      <Pricing />
      <FinalCTA />
    </>
  );
}
