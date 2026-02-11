"use client";

import { useRef, useEffect, useCallback, useState } from "react";

export type EffectType = "breathe" | "shimmer" | "turbulence" | "ripple" | "glow";

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  color: { r: number; g: number; b: number };
  size: number;
  // Each particle has unique noise offsets for organic movement
  seed: number;
  angle: number; // Base angle from center
  dist: number;  // Base distance from center
}

interface ParticleLogoEffectProps {
  size?: number;
  effect?: EffectType;
  audioData: {
    amplitude: number;
    frequencies: Float32Array | null;
    isOnset: boolean;
  };
  className?: string;
}

export function ParticleLogoEffect({
  size = 180,
  audioData,
  className = "",
}: ParticleLogoEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const timeRef = useRef(0);
  const smoothedAmplitudeRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioDataRef = useRef(audioData);
  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Initialize particles from logo
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/AgencerLogoSvg3.svg";
    });

    logoImageRef.current = img;

    // Sample the logo at high resolution
    const sampleSize = 800;
    const logoScale = 0.70;
    const scaleFactor = (size * logoScale) / sampleSize;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = sampleSize;
    tempCanvas.height = sampleSize;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imageData = tempCtx.getImageData(0, 0, sampleSize, sampleSize);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    const sampleCenterX = sampleSize / 2;
    const sampleCenterY = sampleSize / 2;

    const allPositions: { x: number; y: number; r: number; g: number; b: number }[] = [];

    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const i = (y * sampleSize + x) * 4;
        const alpha = pixels[i + 3];
        if (alpha > 30) {
          allPositions.push({
            x: (x - sampleCenterX) * scaleFactor,
            y: (y - sampleCenterY) * scaleFactor,
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
          });
        }
      }
    }

    // High particle count for crisp detail
    const targetCount = 80000;
    const step = Math.max(1, Math.floor(allPositions.length / targetCount));

    for (let i = 0; i < allPositions.length; i += step) {
      const pos = allPositions[i];
      const angle = Math.atan2(pos.y, pos.x);
      const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);

      particles.push({
        x: pos.x,
        y: pos.y,
        z: 0,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 0.5 + Math.random() * 0.3,
        seed: Math.random() * 1000,
        angle,
        dist,
      });
    }

    particlesRef.current = particles;
    isInitializedRef.current = true;
    setIsLoaded(true);
  }, [size, dpr]);

  // Animation loop
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    const logoImg = logoImageRef.current;
    if (!canvas || !logoImg) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const ringRadius = size * 0.47;
    const centerHoleRadius = size * 0.04;

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      // Get raw amplitude
      const rawAmplitude = audioDataRef.current.amplitude;

      // SNAPPY envelope - fast attack, fast release for heartbeat feel
      const attackSpeed = 0.5;
      const releaseSpeed = 0.3;

      if (rawAmplitude > smoothedAmplitudeRef.current) {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * attackSpeed;
      } else {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * releaseSpeed;
      }

      const amplitude = smoothedAmplitudeRef.current;

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring (always visible, wobbles with amplitude)
      ctx.save();
      ctx.beginPath();
      const wobbleAmount = 1 + amplitude * 8;
      const wobbleFreq = 5;
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        const wobble = Math.sin(angle * wobbleFreq + time * 2) * wobbleAmount;
        const r = ringRadius + wobble;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const ringGradient = ctx.createConicGradient(0, centerX, centerY);
      ringGradient.addColorStop(0, "rgba(0, 200, 255, 0.9)");
      ringGradient.addColorStop(0.12, "rgba(0, 100, 255, 0.9)");
      ringGradient.addColorStop(0.25, "rgba(100, 0, 255, 0.9)");
      ringGradient.addColorStop(0.37, "rgba(255, 0, 200, 0.9)");
      ringGradient.addColorStop(0.5, "rgba(255, 0, 100, 0.9)");
      ringGradient.addColorStop(0.62, "rgba(255, 150, 0, 0.9)");
      ringGradient.addColorStop(0.75, "rgba(255, 255, 0, 0.9)");
      ringGradient.addColorStop(0.87, "rgba(0, 255, 100, 0.9)");
      ringGradient.addColorStop(1, "rgba(0, 200, 255, 0.9)");
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 2 + amplitude * 4;
      ctx.stroke();
      ctx.restore();

      // Threshold for switching between solid logo and particles
      const threshold = 0.05;

      if (amplitude < threshold) {
        // SOLID LOGO - clean and crisp when silent
        const logoSize = size * 0.70;
        const logoOffset = (size - logoSize) / 2;
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
      } else {
        // PARTICLES - alive, twisting, bouncing when speaking

        // Normalize amplitude above threshold (0 to 1 range)
        const normalizedAmp = Math.min(1, (amplitude - threshold) / 0.5);

        // Twist amount - full rotation at high amplitude
        const maxTwist = Math.PI * 1.5; // 270 degrees max twist
        const twistAmount = normalizedAmp * maxTwist;

        // Expansion - particles push outward
        const expansion = 1 + normalizedAmp * 0.4;

        // Dispersion - how much particles scatter from their base position
        const dispersion = normalizedAmp * 25;

        for (const p of particles) {
          // Organic noise-based movement
          const noiseTime = time * 1.2;
          const nx = Math.sin(p.seed + noiseTime * 0.7) * Math.cos(p.seed * 0.5 + noiseTime * 0.5);
          const ny = Math.cos(p.seed * 0.7 + noiseTime * 0.6) * Math.sin(p.seed * 0.3 + noiseTime * 0.8);
          const nz = Math.sin(p.seed * 0.4 + noiseTime * 0.9) * 0.5;

          // Apply dispersion based on noise
          const dx = nx * dispersion;
          const dy = ny * dispersion;
          p.z = nz * dispersion;

          // Calculate expanded position
          const expandedX = p.baseX * expansion + dx;
          const expandedY = p.baseY * expansion + dy;

          // Apply twist rotation around center
          const dist = Math.sqrt(expandedX * expandedX + expandedY * expandedY);
          const baseAngle = Math.atan2(expandedY, expandedX);

          // Outer particles twist more (spiral effect)
          const distFactor = Math.min(1, dist / ringRadius);
          const rotatedAngle = baseAngle + twistAmount * distFactor;

          p.x = Math.cos(rotatedAngle) * dist;
          p.y = Math.sin(rotatedAngle) * dist;

          // Keep particles within ring boundary (soft constraint)
          const currentDist = Math.sqrt(p.x * p.x + p.y * p.y);
          const maxDist = ringRadius - 5 + normalizedAmp * 15;
          if (currentDist > maxDist) {
            const scale = maxDist / currentDist;
            p.x *= scale;
            p.y *= scale;
          }

          // Maintain center hole
          if (currentDist < centerHoleRadius) {
            const angle = Math.atan2(p.y, p.x);
            p.x = Math.cos(angle) * centerHoleRadius;
            p.y = Math.sin(angle) * centerHoleRadius;
          }

          // Particle size - varies with depth and amplitude
          const depthScale = 1 + p.z * 0.015;
          const ampScale = 0.8 + normalizedAmp * 0.4;
          const drawSize = Math.max(0.3, Math.min(1.5, p.size * depthScale * ampScale));

          // Draw particle with full opacity
          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, drawSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isLoaded, size, dpr]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
