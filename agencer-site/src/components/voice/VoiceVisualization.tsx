"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface VoiceVisualizationProps {
  size?: number;
  className?: string;
}

// Gold color for breathing dots (original style)
const goldColor = { r: 212, g: 168, b: 83 };

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
    const orbitRadius = size * 0.42;
    const numDots = 32;

    interface Dot {
      angle: number;
      baseRadius: number;
      amplitude: number;
      speed: number;
      phase: number;
    }

    const dots: Dot[] = [];

    // Initialize orbiting dots (original gold style)
    for (let i = 0; i < numDots; i++) {
      dots.push({
        angle: (i / numDots) * Math.PI * 2,
        baseRadius: orbitRadius,
        amplitude: 10 + Math.random() * 20,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Pulse particles that shoot outward
    interface Particle {
      angle: number;
      radius: number;
      speed: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    let lastParticleTime = 0;

    let rotation = 0;

    const animate = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, size, size);

      // Rotate slowly
      if (!prefersReducedMotion) {
        rotation += 0.003;
      }

      // Draw blue wave arc behind the logo
      ctx.beginPath();
      ctx.strokeStyle = "rgba(74, 123, 247, 0.3)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(74, 123, 247, 0.5)";
      ctx.shadowBlur = 15;
      const waveRadius = size * 0.38;
      const waveStart = rotation - Math.PI * 0.4;
      const waveEnd = rotation + Math.PI * 0.4;
      ctx.arc(centerX, centerY, waveRadius, waveStart, waveEnd);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw secondary wave arc
      ctx.beginPath();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
      ctx.lineWidth = 3;
      const wave2Start = rotation + Math.PI * 0.6;
      const wave2End = rotation + Math.PI * 1.4;
      ctx.arc(centerX, centerY, waveRadius + 10, wave2Start, wave2End);
      ctx.stroke();

      // Spawn new pulse particles occasionally (gold color)
      if (!prefersReducedMotion && time - lastParticleTime > 0.2 && Math.random() > 0.6) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: size * 0.28,
          speed: 1 + Math.random() * 2,
          size: 2 + Math.random() * 3,
          opacity: 0.8,
        });
        lastParticleTime = time;
      }

      // Update and draw pulse particles (gold)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.radius += p.speed;
        p.opacity -= 0.015;

        if (p.opacity <= 0 || p.radius > size * 0.5) {
          particles.splice(i, 1);
          continue;
        }

        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${goldColor.r}, ${goldColor.g}, ${goldColor.b}, ${p.opacity})`;
        ctx.shadowColor = `rgba(${goldColor.r}, ${goldColor.g}, ${goldColor.b}, ${p.opacity * 0.5})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw orbiting dots with breathing animation (original gold style)
      dots.forEach((dot) => {
        const pulse = prefersReducedMotion
          ? 0
          : Math.sin(time * dot.speed + dot.phase) * dot.amplitude;

        // Radial position pulses in and out
        const currentRadius = dot.baseRadius + pulse;
        const x = centerX + Math.cos(dot.angle + rotation) * currentRadius;
        const y = centerY + Math.sin(dot.angle + rotation) * currentRadius;

        // BREATHING EFFECT: dot size and opacity change with pulse
        const dotSize = 3 + (pulse / dot.amplitude) * 2;
        const opacity = 0.6 + (pulse / dot.amplitude) * 0.4;

        // Draw the dot with glow
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${goldColor.r}, ${goldColor.g}, ${goldColor.b}, ${opacity})`;
        ctx.shadowColor = `rgba(${goldColor.r}, ${goldColor.g}, ${goldColor.b}, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw soft glow around center (where logo will be)
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        size * 0.12,
        centerX,
        centerY,
        size * 0.3
      );
      glowGradient.addColorStop(0, "rgba(232, 168, 56, 0.15)");
      glowGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
      glowGradient.addColorStop(1, "rgba(74, 123, 247, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
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
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Canvas for orbiting dots and effects */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ width: size, height: size }}
      />

      {/* Actual Agencer logo in the center */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      >
        <Image
          src="/agencer-logo.png"
          alt="Agencer"
          width={size * 0.5}
          height={size * 0.5}
          className="animate-spin-slow"
          style={{
            filter: "drop-shadow(0 0 20px rgba(232, 168, 56, 0.4))",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(232, 168, 56, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.4));
          }
        }
      `}</style>
    </div>
  );
}
