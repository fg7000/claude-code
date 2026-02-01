"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "1",
    title: "You speak.",
    body: "Natural language. No commands to memorize. No syntax. You talk the way you'd talk to a sharp colleague.",
    example: "Find me flights to Tokyo next month, check my calendar for conflicts, and draft an out-of-office for the days I'll be gone.",
  },
  {
    number: "2",
    title: "Agencer thinks.",
    body: "The platform analyzes your request, breaks it into subtasks, and selects the best AI model for each one. Claude for research. GPT for drafting. Gemini for data. The right tool for the right job.",
  },
  {
    number: "3",
    title: "Tools connect.",
    body: "Agencer reaches into your connected services: Gmail, Google Calendar, Slack, Shopify, GitHub, whatever you use. If something isn't connected yet, it can discover and connect to it automatically. APIs, MCP servers, even browser automation for tools without APIs.",
  },
  {
    number: "4",
    title: "Models coordinate.",
    body: "This is the part nobody else does. Through AMP (Agent Messaging Protocol), your AI models actually talk to each other. They share context, hand off subtasks, and combine results. Not sequential. Orchestrated.",
  },
  {
    number: "5",
    title: "You get the result.",
    body: "A synthesized, complete result. Not fragments from different tools you have to assemble. The finished thing. Reviewed, combined, delivered.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!sectionRef.current || !lineRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-20">
          <SectionLabel>How It Works</SectionLabel>
          <h2
            className="font-serif font-medium text-text-headline"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Five seconds from thought to action.
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line - Desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div
              ref={lineRef}
              className="h-full w-full origin-top"
              style={{ backgroundColor: "rgba(212, 168, 83, 0.2)" }}
            />
          </div>

          {/* Left line - Mobile only */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-px">
            <div
              className="h-full w-full origin-top"
              style={{ backgroundColor: "rgba(212, 168, 83, 0.2)" }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`relative flex items-start gap-6 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Number circle - Mobile */}
                <div className="md:hidden flex-shrink-0 w-8 h-8 rounded-full border border-accent-gold bg-bg-primary flex items-center justify-center z-10">
                  <span className="font-mono text-sm text-accent-gold">{step.number}</span>
                </div>

                {/* Content */}
                <div className={`flex-1 md:w-[calc(50%-40px)] ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <h3 className="font-sans font-semibold text-text-headline text-xl mb-3">
                    {step.title}
                  </h3>
                  <p className="font-sans text-text-secondary leading-relaxed mb-4">
                    {step.body}
                  </p>
                  {step.example && (
                    <GlassPanel className="p-4 inline-block text-left">
                      <p className="font-mono text-sm text-text-secondary/80">
                        {step.example}
                      </p>
                    </GlassPanel>
                  )}
                </div>

                {/* Number circle - Desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border border-accent-gold bg-bg-primary items-center justify-center z-10">
                  <span className="font-mono text-sm text-accent-gold">{step.number}</span>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block md:w-[calc(50%-40px)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
