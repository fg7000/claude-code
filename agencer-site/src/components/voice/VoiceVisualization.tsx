"use client";

import { useEffect, useRef } from "react";

interface VoiceVisualizationProps {
  size?: number;
  className?: string;
}

export function VoiceVisualization({ size = 300, className = "" }: VoiceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const innerRadius = size * 0.25;
    const outerRadius = size * 0.4;
    const numDots = 48;
    const dots: { angle: number; baseRadius: number; amplitude: number; speed: number; phase: number }[] = [];

    // Initialize dots
    for (let i = 0; i < numDots; i++) {
      dots.push({
        angle: (i / numDots) * Math.PI * 2,
        baseRadius: outerRadius,
        amplitude: 10 + Math.random() * 20,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Rotate slowly
      if (!prefersReducedMotion) {
        rotation += 0.002;
      }

      // Draw inner gradient circle
      const gradient = ctx.createConicGradient(rotation, centerX, centerY);
      gradient.addColorStop(0, "#D4A853");
      gradient.addColorStop(0.33, "#C76B4A");
      gradient.addColorStop(0.66, "#6B3FA0");
      gradient.addColorStop(1, "#D4A853");

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw pulsing outer dots
      dots.forEach((dot, i) => {
        const time = Date.now() * 0.001;
        const pulse = prefersReducedMotion
          ? 0
          : Math.sin(time * dot.speed + dot.phase) * dot.amplitude;

        const currentRadius = dot.baseRadius + pulse;
        const x = centerX + Math.cos(dot.angle + rotation) * currentRadius;
        const y = centerY + Math.sin(dot.angle + rotation) * currentRadius;

        // Gradient color based on position
        const colorPhase = (dot.angle + rotation) / (Math.PI * 2);
        let r, g, b;

        if (colorPhase < 0.33) {
          // Gold to copper
          const t = colorPhase / 0.33;
          r = Math.round(212 + (199 - 212) * t);
          g = Math.round(168 + (107 - 168) * t);
          b = Math.round(83 + (74 - 83) * t);
        } else if (colorPhase < 0.66) {
          // Copper to violet
          const t = (colorPhase - 0.33) / 0.33;
          r = Math.round(199 + (107 - 199) * t);
          g = Math.round(107 + (63 - 107) * t);
          b = Math.round(74 + (160 - 74) * t);
        } else {
          // Violet to gold
          const t = (colorPhase - 0.66) / 0.34;
          r = Math.round(107 + (212 - 107) * t);
          g = Math.round(63 + (168 - 63) * t);
          b = Math.round(160 + (83 - 160) * t);
        }

        const dotSize = 3 + (pulse / dot.amplitude) * 2;
        const opacity = 0.6 + (pulse / dot.amplitude) * 0.4;

        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      });

      // Draw glow effect
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        innerRadius * 0.5,
        centerX,
        centerY,
        innerRadius * 1.5
      );
      glowGradient.addColorStop(0, "rgba(212, 168, 83, 0.3)");
      glowGradient.addColorStop(1, "rgba(212, 168, 83, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
