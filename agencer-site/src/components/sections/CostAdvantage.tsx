"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { FloatingDotsSection } from "@/components/animations/FloatingDots";

export function CostAdvantage() {
  return (
    <section
      id="cost-advantage"
      className="relative py-32 md:py-40 overflow-hidden bg-bg-secondary"
    >
      {/* Floating dots - cooler colors */}
      <FloatingDotsSection count={20} />

      {/* Blue wave glow at the top */}
      <div
        className="absolute top-0 left-0 right-0 h-96 opacity-20"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(74, 123, 247, 0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <SectionLabel className="mb-4">The Math</SectionLabel>
          <h2
            className="font-serif font-medium text-text-headline mb-6 whitespace-nowrap"
            style={{ fontSize: "clamp(1.5rem, 4vw, 3.5rem)" }}
          >
            More capable. Less expensive. Not a typo.
          </h2>
        </motion.div>

        {/* Body text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <p className="font-sans text-text-secondary leading-relaxed mb-6" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}>
            There was a time when companies ran their own servers. Then managed infrastructure happened. Right now, people are running AI agents on hardware in their closet, managing their own API keys, and hoping nothing breaks.
          </p>
          <p className="font-sans text-text-secondary leading-relaxed mb-6" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}>
            We&apos;ve all seen how that goes. Surprise bills that hit four figures in a week. Credentials in plaintext. Security researchers finding exposed instances on public scans.
          </p>
          <p className="font-sans text-text-secondary leading-relaxed" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}>
            Agencer is managed AI orchestration. You see what every action costs before it runs. Every credential encrypted. Every model sandboxed. The power without the exposure.
          </p>
        </motion.div>

        {/* Highlighted stat block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <GlassPanel highlighted className="p-8 md:p-12 text-center max-w-3xl mx-auto">
            <p
              className="font-serif font-medium text-text-headline"
              style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
            >
              One subscription. Every model. Every tool. Your cost goes down. Your output goes up.
            </p>
          </GlassPanel>
        </motion.div>

        {/* Stat cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { stat: "50-70% less", description: "than paying for each AI separately" },
            { stat: "Zero glue work", description: "no more copying between tools" },
            { stat: "Pay per use", description: "credits map to real cost, not guesswork" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <GlassPanel className="p-6 text-center h-full">
                <p className="font-serif text-2xl md:text-3xl text-text-headline mb-2">
                  {item.stat}
                </p>
                <p className="font-sans text-sm text-text-secondary">
                  {item.description}
                </p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Footer note and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <p className="font-mono text-sm text-accent-warm mb-8">
            Open-source models running on US servers. No runaway API costs. No surprise bills. Full cost transparency.
          </p>
          <Button variant="outline" href="#pricing">
            See Pricing
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
