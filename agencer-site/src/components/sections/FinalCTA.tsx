"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FloatingDotsSection } from "@/components/animations/FloatingDots";

// Logo spectrum colors for particles
const PARTICLE_COLORS = [
  "232, 168, 56",   // amber
  "212, 114, 74",   // copper
  "199, 85, 119",   // rose
  "139, 92, 246",   // violet
  "99, 102, 241",   // indigo
  "59, 130, 246",   // blue
  "20, 184, 166",   // teal
];

export function FinalCTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const openVoiceWidget = () => {
    const event = new CustomEvent("openVoiceWidget");
    window.dispatchEvent(event);
  };

  // Floating particles effect with logo spectrum colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particles with varied colors
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const numParticles = 40;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.8,
        size: 1 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      });
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset particle when it goes off screen
        if (p.y < -10) {
          p.y = rect.height + 10;
          p.x = Math.random() * rect.width;
          p.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        }

        // Draw particle with glow
        const x = p.x / (window.devicePixelRatio || 1);
        const y = p.y / (window.devicePixelRatio || 1);

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.3})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section
      id="final-cta"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary"
    >
      {/* Background with warm glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(20, 20, 26, 1) 0%, rgba(10, 10, 10, 1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, rgba(74, 123, 247, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Floating dots */}
      <FloatingDotsSection count={30} />

      {/* Floating particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        {/* Logo with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mb-12"
        >
          <Image
            src="/agencer-logo.png"
            alt="Agencer"
            width={200}
            height={200}
            className="relative z-10"
          />
          <div
            className="absolute inset-0 blur-3xl opacity-40 z-0"
            style={{
              background: "radial-gradient(circle, rgba(74, 123, 247, 0.5) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif font-medium text-text-headline mb-4"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Your orchestra is waiting.
        </motion.h2>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-text-secondary mb-10"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
        >
          Every model. Every tool. One voice. Yours.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Button variant="solid" size="lg" href="#">
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" onClick={openVoiceWidget}>
            Talk to Agencer
          </Button>
        </motion.div>

        {/* Small text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-sans text-sm text-text-secondary/70"
        >
          Free tier. 100 credits. No credit card. Start in thirty seconds.
        </motion.p>
      </div>
    </section>
  );
}
