"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AgencerLogo } from "@/components/ui/AgencerLogo";

const cards = [
  {
    quote: "Research the competitive landscape for autonomous vehicles and email me a summary.",
    body: "Agencer routes to Claude for deep research. Cross-references with Gemini for recent data. Drafts the summary with GPT. Sends it to your Gmail.",
    footer: "Three models. Two tools. One sentence from you.",
  },
  {
    quote: "Post about our product launch to LinkedIn, Twitter, and Instagram. Make it sound different on each one.",
    body: "Agencer writes platform-native copy for each. Generates a custom image. Formats for each platform's specs. Posts simultaneously.",
    footer: "One command. Six deliverables.",
  },
  {
    quote: "Analyze last month's sales data from Shopify, compare it to the month before, and put the highlights in a Google Doc.",
    body: "Agencer pulls from your Shopify API. Runs analysis through the best model for numbers. Writes the narrative. Creates the doc in your Drive.",
    footer: "Your morning briefing, built while you slept.",
  },
];

export function TheSolution() {
  return (
    <section
      id="the-solution"
      className="relative py-32 md:py-48 flex items-center justify-center bg-bg-primary overflow-hidden"
    >
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(212, 168, 83, 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Logo at top */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <AgencerLogo size={60} className="opacity-80" />
        <div
          className="absolute inset-0 blur-xl"
          style={{ background: "rgba(212, 168, 83, 0.3)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <SectionLabel>The Conductor</SectionLabel>
          <h2
            className="font-serif font-medium text-text-headline"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Tell Agencer what you need. Walk away.
          </h2>
        </motion.div>

        {/* Cards container */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-stretch">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="w-full max-w-[400px]"
            >
              <GlassPanel className="p-6 h-full flex flex-col" hover>
                {/* Quote */}
                <p className="font-serif italic text-text-headline text-lg leading-relaxed mb-4">
                  &ldquo;{card.quote}&rdquo;
                </p>

                {/* Body */}
                <p className="font-sans text-text-secondary text-sm leading-relaxed mb-6 flex-grow">
                  {card.body}
                </p>

                {/* Footer tagline - prominent */}
                <p className="font-mono text-sm md:text-base text-accent-warm font-medium mt-auto pt-4 border-t border-white/10">
                  {card.footer}
                </p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
