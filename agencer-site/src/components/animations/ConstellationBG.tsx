"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  opacity: number;
  targetOpacity: number;
  connections: number[];
}

export function ConstellationBG({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars
    const numStars = 40;
    const stars: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      const star: Star = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: 0,
        targetOpacity: 0.3 + Math.random() * 0.7,
        connections: [],
      };

      // Create connections to nearby stars
      for (let j = 0; j < i; j++) {
        const dx = star.x - stars[j].x;
        const dy = star.y - stars[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150 && Math.random() > 0.5) {
          star.connections.push(j);
        }
      }

      stars.push(star);
    }

    starsRef.current = stars;

    const animate = () => {
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Update and draw stars
      stars.forEach((star, i) => {
        // Fade in
        if (star.opacity < star.targetOpacity) {
          star.opacity += prefersReducedMotion ? star.targetOpacity : 0.005;
        }

        // Twinkle effect
        if (!prefersReducedMotion) {
          star.targetOpacity = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.35 + 0.35;
        }

        // Draw connections
        star.connections.forEach((connIndex) => {
          const connStar = stars[connIndex];
          const connectionOpacity = Math.min(star.opacity, connStar.opacity) * 0.1;

          ctx.beginPath();
          ctx.moveTo(star.x / (window.devicePixelRatio || 1), star.y / (window.devicePixelRatio || 1));
          ctx.lineTo(connStar.x / (window.devicePixelRatio || 1), connStar.y / (window.devicePixelRatio || 1));
          ctx.strokeStyle = `rgba(212, 168, 83, ${connectionOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });

        // Draw star
        ctx.beginPath();
        ctx.arc(
          star.x / (window.devicePixelRatio || 1),
          star.y / (window.devicePixelRatio || 1),
          2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(212, 168, 83, ${star.opacity * 0.8})`;
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
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
