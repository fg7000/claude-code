"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GradientBlobs } from "@/components/animations/GradientBlobs";
import { AgencerLogo } from "@/components/ui/AgencerLogo";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const openVoiceWidget = () => {
    const event = new CustomEvent("openVoiceWidget");
    window.dispatchEvent(event);
  };

  // Floating embers effect
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

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const numParticles = 30;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 1,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
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
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x / (window.devicePixelRatio || 1), p.y / (window.devicePixelRatio || 1), p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha})`;
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Warm gradient background */}
      <GradientBlobs variant="warm" />

      {/* Floating embers canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
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
          <AgencerLogo size={200} />
          <div
            className="absolute inset-0 blur-3xl opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(212, 168, 83, 0.5) 0%, transparent 70%)",
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
