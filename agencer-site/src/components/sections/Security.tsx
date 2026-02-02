"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const statements = [
  "Encrypted credential storage. Isolated user environments.",
  "Context boundaries that ensure each AI model only sees what it needs for its specific task.",
  "Human-in-the-loop approval for sensitive actions. Full audit logging.",
  "No mass training on your data. No selling your information. No surprises.",
  "Open-source models like DeepSeek and Llama are routed through Amazon Bedrock on US servers. Nothing goes to China. Nothing leaves your control.",
];

export function Security() {
  return (
    <section
      id="security"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
        {/* Shield icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <Shield className="w-12 h-12 text-accent-gold" strokeWidth={1.5} />
        </motion.div>

        <SectionLabel>Trust</SectionLabel>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif font-medium text-text-headline mb-16"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          Your data stays yours.
        </motion.h2>

        <div className="space-y-8">
          {statements.map((statement, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="font-sans text-text-secondary leading-relaxed text-center"
              style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}
            >
              {statement}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
