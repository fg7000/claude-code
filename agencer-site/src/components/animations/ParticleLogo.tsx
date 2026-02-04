"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: { r: number; g: number; b: number };
  size: number;
  vx: number;
  vy: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
  angleFromCenter: number;
  distFromCenter: number;
}

interface ParticleLogoProps {
  size?: number;
  particleCount?: number;
  isActive?: boolean;
  audioData?: Uint8Array | null;
  className?: string;
}

export function ParticleLogo({
  size = 200,
  isActive = false,
  audioData = null,
  className = "",
}: ParticleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const smoothedAmplitudeRef = useRef(0);
  const timeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Multi-octave noise for more organic chaotic motion
  const noise = useCallback((x: number, y: number, time: number): number => {
    const n1 = Math.sin(x * 0.015 + time) * Math.cos(y * 0.015 + time * 0.7);
    const n2 = Math.sin(x * 0.04 - time * 1.3) * Math.cos(y * 0.025 + time * 0.5);
    const n3 = Math.sin(x * 0.08 + time * 0.9) * Math.cos(y * 0.06 - time * 0.4);
    return n1 * 0.5 + n2 * 0.35 + n3 * 0.15;
  }, []);

  // Initialize particles from logo
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Load the logo image
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/AgencerLogoSvg3.svg";
    });

    // Sample at high resolution
    const sampleSize = 800;
    // Logo occupies ~70% of canvas, leaving gap for ring
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

    // 80000 particles for ultra-fine stipple
    const targetCount = 80000;
    const step = Math.max(1, Math.floor(allPositions.length / targetCount));

    for (let i = 0; i < allPositions.length; i += step) {
      const pos = allPositions[i];
      const distFromCenter = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      const angleFromCenter = Math.atan2(pos.y, pos.x);

      particles.push({
        x: pos.x,
        y: pos.y,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 0.3 + Math.random() * 0.25,
        vx: 0,
        vy: 0,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.4 + Math.random() * 1.0,
        angleFromCenter,
        distFromCenter,
      });
    }

    particlesRef.current = particles;
    setIsInitialized(true);
  }, [size, dpr]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    // Ring positioned at edge with gap from logo
    const ringRadius = size * 0.47;
    const centerHoleRadius = size * 0.06;
    // Max logo radius (where particles start)
    const logoRadius = size * 0.35;

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      // Calculate amplitude from audio data
      let targetAmplitude = 0;
      if (isActive && audioData && audioData.length > 0) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
          sum += audioData[i];
        }
        targetAmplitude = sum / audioData.length / 255;
      }

      // Smooth amplitude
      smoothedAmplitudeRef.current += (targetAmplitude - smoothedAmplitudeRef.current) * 0.12;
      const amplitude = isActive ? Math.max(0.25, smoothedAmplitudeRef.current) : smoothedAmplitudeRef.current;

      // Dispersion controls how much particles spread from logo formation
      // 0 = tight logo shape, 1 = max spread
      const dispersion = isActive ? Math.min(1, amplitude * 2.0) : 0;

      // Expansion factor - how far particles can go (can exceed ring on high audio)
      // At low audio: particles stay near logo position
      // At high audio: particles expand toward and beyond ring
      const expansionFactor = 1 + dispersion * 0.8; // Up to 1.8x expansion

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring with wobble animation
      ctx.save();
      ctx.beginPath();

      const wobbleAmount = 1.5 + amplitude * 4;
      const wobbleFreq = 6;
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        const wobble = Math.sin(angle * wobbleFreq + time * 2.5) * wobbleAmount;
        const r = ringRadius + wobble;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Rainbow gradient
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
      ctx.lineWidth = 2.5 + amplitude * 2;
      ctx.stroke();
      ctx.restore();

      // ALWAYS draw particles (never solid logo)
      for (const p of particles) {
        // Chaotic noise-based displacement
        const noiseX = noise(p.noiseOffsetX, p.noiseOffsetY, time * p.speed);
        const noiseY = noise(p.noiseOffsetY, p.noiseOffsetX, time * p.speed * 1.1);

        // Displacement amount increases with dispersion
        const chaosAmount = dispersion * 55;

        // Radial expansion - particles move outward with audio
        const radialExpansion = (p.distFromCenter / logoRadius) * dispersion * 25;

        // Target position: base + chaos + radial expansion
        const expandedBaseX = p.baseX * expansionFactor;
        const expandedBaseY = p.baseY * expansionFactor;

        const targetX = expandedBaseX + noiseX * chaosAmount;
        const targetY = expandedBaseY + noiseY * chaosAmount;

        // Smooth velocity-based movement
        p.vx += (targetX - p.x) * 0.08;
        p.vy += (targetY - p.y) * 0.08;
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Soft boundary at ring (allow some overflow on high amplitude)
        const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
        const softMaxDist = ringRadius + (amplitude > 0.5 ? (amplitude - 0.5) * 40 : 0);

        if (distFromCenter > softMaxDist) {
          // Soft push back, not hard constraint
          const angle = Math.atan2(p.y, p.x);
          const overflow = distFromCenter - softMaxDist;
          p.x -= Math.cos(angle) * overflow * 0.3;
          p.y -= Math.sin(angle) * overflow * 0.3;
        }

        // Preserve center hole
        if (distFromCenter < centerHoleRadius) {
          const angle = Math.atan2(p.y, p.x);
          const pushStrength = (1 - distFromCenter / centerHoleRadius) * 8;
          p.x += Math.cos(angle) * pushStrength;
          p.y += Math.sin(angle) * pushStrength;
        }

        // Draw particle
        const drawX = centerX + p.x;
        const drawY = centerY + p.y;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 1)`;
        ctx.fill();
      }

      // When not active, smoothly return to logo formation
      if (!isActive) {
        for (const p of particles) {
          p.x += (p.baseX - p.x) * 0.08;
          p.y += (p.baseY - p.y) * 0.08;
        }
        smoothedAmplitudeRef.current *= 0.92;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isInitialized, isActive, audioData, size, dpr, noise]);

  // Initialize on mount
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
