"use client";

import { useEffect, useRef } from "react";

interface BlueWaveProps {
  intensity?: "low" | "normal" | "high";
  className?: string;
}

export function BlueWave({ intensity = "normal", className = "" }: BlueWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track scroll position
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Intensity multipliers
    const intensityMap = {
      low: 0.5,
      normal: 1,
      high: 1.5,
    };
    const intensityMultiplier = intensityMap[intensity];

    let time = 0;

    const animate = () => {
      if (prefersReducedMotion) {
        // Static wave for reduced motion
        drawStaticWave(ctx, canvas.width, canvas.height, intensityMultiplier);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      time += 0.005;

      // Calculate wave position based on scroll
      const scrollProgress = scrollRef.current / (document.body.scrollHeight - window.innerHeight);
      const waveYOffset = Math.sin(scrollProgress * Math.PI * 2) * 100;
      const waveXOffset = Math.cos(scrollProgress * Math.PI) * 50;

      // Draw the blue wave
      drawWave(ctx, width, height, time, waveYOffset, waveXOffset, intensityMultiplier);

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameRef.current);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        filter: "blur(60px)",
        opacity: 0.12,
      }}
    />
  );
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  yOffset: number,
  xOffset: number,
  intensity: number
) {
  // Create gradient for the wave
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Blue
  gradient.addColorStop(0.3, "rgba(74, 123, 247, 0.5)"); // Wave blue
  gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.4)"); // Indigo
  gradient.addColorStop(0.7, "rgba(139, 92, 246, 0.3)"); // Violet
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)"); // Blue

  ctx.fillStyle = gradient;

  // Draw main wave
  ctx.beginPath();

  const baseY = height * 0.6 + yOffset;
  const amplitude = 80 * intensity;
  const frequency = 0.003;

  ctx.moveTo(-100 + xOffset, height);

  for (let x = -100; x <= width + 100; x += 5) {
    const y = baseY +
      Math.sin(x * frequency + time) * amplitude +
      Math.sin(x * frequency * 2 + time * 1.5) * (amplitude * 0.3) +
      Math.sin(x * frequency * 0.5 + time * 0.5) * (amplitude * 0.5);

    ctx.lineTo(x + xOffset, y);
  }

  ctx.lineTo(width + 100 + xOffset, height);
  ctx.closePath();
  ctx.fill();

  // Draw secondary wave (lighter, offset)
  const gradient2 = ctx.createLinearGradient(0, 0, width, 0);
  gradient2.addColorStop(0, "rgba(74, 123, 247, 0.2)");
  gradient2.addColorStop(0.5, "rgba(99, 102, 241, 0.3)");
  gradient2.addColorStop(1, "rgba(74, 123, 247, 0.2)");

  ctx.fillStyle = gradient2;
  ctx.beginPath();

  const baseY2 = height * 0.65 + yOffset * 0.8;
  const amplitude2 = 60 * intensity;

  ctx.moveTo(-100 - xOffset * 0.5, height);

  for (let x = -100; x <= width + 100; x += 5) {
    const y = baseY2 +
      Math.sin(x * frequency * 0.8 + time * 1.2 + 1) * amplitude2 +
      Math.sin(x * frequency * 1.5 + time * 0.8) * (amplitude2 * 0.4);

    ctx.lineTo(x - xOffset * 0.5, y);
  }

  ctx.lineTo(width + 100, height);
  ctx.closePath();
  ctx.fill();

  // Draw glow line at the crest (like in the video)
  ctx.strokeStyle = "rgba(74, 123, 247, 0.8)";
  ctx.lineWidth = 3 * intensity;
  ctx.shadowColor = "rgba(74, 123, 247, 0.8)";
  ctx.shadowBlur = 20;

  ctx.beginPath();
  for (let x = -100; x <= width + 100; x += 5) {
    const y = baseY +
      Math.sin(x * frequency + time) * amplitude +
      Math.sin(x * frequency * 2 + time * 1.5) * (amplitude * 0.3) +
      Math.sin(x * frequency * 0.5 + time * 0.5) * (amplitude * 0.5);

    if (x === -100) {
      ctx.moveTo(x + xOffset, y);
    } else {
      ctx.lineTo(x + xOffset, y);
    }
  }
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;
}

function drawStaticWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
  gradient.addColorStop(0.5, "rgba(74, 123, 247, 0.3)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.55, width, height * 0.15 * intensity);
}
