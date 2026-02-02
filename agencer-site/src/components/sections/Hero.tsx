"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FloatingDotsSection } from "@/components/animations/FloatingDots";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !sectionRef.current || !contentRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.95,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary"
    >
      {/* Dark gradient background with subtle movement */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(14, 14, 18, 1) 0%, rgba(10, 10, 10, 1) 100%)",
          }}
        />
        {/* Subtle animated gradient shift */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 70%, rgba(74, 123, 247, 0.05) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Floating dots */}
      <FloatingDotsSection count={25} />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto"
      >
        {/* Logo with rotation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src="/agencer-logo.png"
            alt="Agencer"
            width={120}
            height={120}
            className="logo-rotate"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="font-serif font-medium text-text-headline leading-tight mb-4 whitespace-nowrap"
          style={{ fontSize: "clamp(2rem, 6vw, 5.5rem)" }}
        >
          Every AI. Every tool. One voice.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
          className="font-sans text-text-secondary max-w-xl leading-relaxed mb-8"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
        >
          Tell it what you need. It figures out the rest.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        >
          <Button variant="outline" size="lg" href="#">
            Get Started Free
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <div className="scroll-indicator-dot absolute top-0 left-0 w-full h-2 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
