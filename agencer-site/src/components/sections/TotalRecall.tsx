"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ConstellationBG } from "@/components/animations/ConstellationBG";

export function TotalRecall() {
  return (
    <section
      id="total-recall"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      {/* Constellation background */}
      <ConstellationBG />

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <SectionLabel>Total Recall</SectionLabel>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="font-serif font-medium text-text-headline mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          It never forgets.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-sans text-text-secondary leading-relaxed mb-8"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
        >
          Every conversation. Every preference. Every decision you&apos;ve made together. Agencer remembers all of it, across every session, across every tool.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-text-secondary leading-relaxed mb-8"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
        >
          You mentioned you prefer Claude for writing and GPT for images six weeks ago. Agencer still knows. You connected your Shopify store last month. Agencer remembers your product catalog.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-text-secondary leading-relaxed mb-12"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
        >
          Other assistants start fresh every time you open them. Agencer picks up exactly where you left off.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-serif italic text-accent-gold"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          &ldquo;The more we work together, the more useful I become.&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
