"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { VoiceVisualization } from "@/components/voice/VoiceVisualization";

export function VoiceFirst() {
  const openVoiceWidget = () => {
    const event = new CustomEvent("openVoiceWidget");
    window.dispatchEvent(event);
  };

  return (
    <section
      id="voice-first"
      className="relative min-h-screen flex items-center bg-bg-primary overflow-hidden py-24"
    >
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Visualization - Left side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 flex justify-center"
          >
            <VoiceVisualization size={300} className="w-[200px] h-[200px] lg:w-[300px] lg:h-[300px]" />
          </motion.div>

          {/* Content - Right side */}
          <div className="w-full lg:w-1/2">
            <SectionLabel>Voice-First</SectionLabel>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="font-serif font-medium text-text-headline mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              No screens to learn. No buttons to find. Just talk.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-sans text-text-secondary leading-relaxed mb-6"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
            >
              Agencer was built for voice from day one. Not bolted on. Not a feature. The foundation.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-text-secondary leading-relaxed mb-6"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
            >
              It was born from necessity: a founder who lost the use of his hand and needed an AI he could drive with his voice alone. That constraint became the product&apos;s greatest strength.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-sans text-text-secondary leading-relaxed mb-8"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
            >
              Every interaction, every connection, every orchestration, controlled by speaking naturally. Like giving instructions to the smartest person in the room.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button variant="solid" size="lg" onClick={openVoiceWidget}>
                Try it now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
