"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AgencerLogo } from "@/components/ui/AgencerLogo";

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!sectionRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Pin the section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        pinSpacing: true,
      });

      // Animate cards
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        gsap.set(card, {
          opacity: 0,
          x: 100,
          rotateY: 5,
        });

        gsap.to(card, {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `${25 + i * 25}% top`,
            end: `${35 + i * 25}% top`,
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="the-solution"
      className="relative min-h-screen flex items-center justify-center bg-bg-primary overflow-hidden"
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
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-32">
        <div className="text-center mb-16">
          <SectionLabel>The Conductor</SectionLabel>
          <h2
            className="font-serif font-medium text-text-headline"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Tell Agencer what you need. Walk away.
          </h2>
        </div>

        {/* Cards container */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-stretch">
          {cards.map((card, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="w-full max-w-[400px]"
              style={{ perspective: "1000px" }}
            >
              <GlassPanel className="p-6 h-full flex flex-col" hover>
                {/* Voice waveform icon */}
                <div className="flex gap-1 items-end h-6 mb-4">
                  <div className="w-1 h-3 bg-white/60 rounded-full" />
                  <div className="w-1 h-5 bg-white/60 rounded-full" />
                  <div className="w-1 h-4 bg-white/60 rounded-full" />
                </div>

                {/* Quote */}
                <p className="font-serif italic text-text-headline text-lg leading-relaxed mb-4">
                  &ldquo;{card.quote}&rdquo;
                </p>

                {/* Body */}
                <p className="font-sans text-text-secondary text-sm leading-relaxed mb-6 flex-grow">
                  {card.body}
                </p>

                {/* Footer */}
                <p className="font-mono text-xs text-accent-gold">
                  {card.footer}
                </p>
              </GlassPanel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
