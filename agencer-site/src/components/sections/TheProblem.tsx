"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FloatingDotsSection } from "@/components/animations/FloatingDots";

gsap.registerPlugin(ScrollTrigger);

export function TheProblem() {
  const sectionRef = useRef<HTMLElement>(null);

  const lines = [
    "You pay for Claude. You pay for ChatGPT. You pay for Gemini.",
    "And then you spend your day copying between them.",
    "",
    "Re-explaining context. Switching tabs. Losing threads.",
    "Managing six tools that don't know about each other.",
  ];

  return (
    <section
      ref={sectionRef}
      id="the-problem"
      className="relative py-32 md:py-48 flex items-center justify-center bg-bg-primary overflow-hidden"
    >
      {/* Floating dots */}
      <FloatingDotsSection count={15} />

      {/* Tangled lines background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M100,200 Q300,100 500,300 T900,200" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M50,400 Q250,300 450,500 T850,400" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M150,600 Q350,500 550,700 T950,600" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M0,800 Q200,700 400,900 T800,800" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M200,100 Q400,200 300,400 T600,500 Q800,600 700,800" fill="none" stroke="#333" strokeWidth="1" />
        <path d="M800,100 Q600,200 700,400 T400,500 Q200,600 300,800" fill="none" stroke="#333" strokeWidth="1" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <SectionLabel className="mb-6">The Tax</SectionLabel>

          <h2
            className="font-serif font-medium text-text-headline mb-12"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            You&apos;re paying a tax you didn&apos;t agree to.
          </h2>
        </motion.div>

        <div className="space-y-4">
          {lines.map((line, i) =>
            line === "" ? (
              <div key={i} className="h-6" />
            ) : (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="font-sans text-text-secondary leading-relaxed"
                style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}
              >
                {line}
              </motion.p>
            )
          )}
        </div>
      </div>
    </section>
  );
}
