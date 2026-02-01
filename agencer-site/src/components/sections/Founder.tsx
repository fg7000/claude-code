"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Founder() {
  return (
    <section
      id="founder"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Video/Photo placeholder - Left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-3/5"
          >
            <div className="relative aspect-video rounded-xl border border-accent-gold/30 overflow-hidden bg-bg-secondary">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-text-secondary/50 text-sm mb-4">Founder Video</span>
                <button
                  className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/50 flex items-center justify-center transition-all duration-300 hover:bg-accent-gold/20"
                  aria-label="Play video"
                >
                  <Play className="w-6 h-6 text-accent-gold ml-1" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Content - Right side */}
          <div className="w-full lg:w-2/5">
            <SectionLabel>Why This Exists</SectionLabel>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="font-serif font-medium text-text-headline mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Built with one hand. Built for everyone.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4 mb-8"
            >
              <p className="font-sans text-text-secondary leading-relaxed">
                Seven surgeries. Partial paralysis in my left hand. Suddenly every AI tool required two hands and infinite patience.
              </p>

              <p className="font-sans text-text-secondary leading-relaxed">
                I didn&apos;t need a better chatbot. I needed something that could take a voice command and actually get things done across every tool I use. Something that could pick the right AI for the right task without me managing the logistics.
              </p>

              <p className="font-sans text-text-secondary leading-relaxed">
                So I built it.
              </p>

              <p className="font-sans text-text-secondary leading-relaxed">
                Agencer started as a personal tool. An automatic transmission for AI, because I could only drive with one hand. But once it worked, keeping it private felt selfish.
              </p>

              <p className="font-sans text-text-secondary leading-relaxed">
                Now it&apos;s yours.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="font-sans font-semibold text-text-headline">
                Faryar Ghazanfari
              </p>
              <p className="font-sans text-text-secondary text-sm">
                CEO and Co-founder, Agencer
              </p>
              <p className="font-mono text-xs text-text-secondary/70 mt-1">
                UC Berkeley EECS | Former Head of Open Source, Tesla
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
