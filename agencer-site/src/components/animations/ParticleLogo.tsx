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
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const smoothedAmplitudeRef = useRef(0);
  const timeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Multi-octave noise for chaotic motion
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

    logoImageRef.current = img;

    // Sample at high resolution
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
    const logoImg = logoImageRef.current;
    if (!canvas || !logoImg) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const ringRadius = size * 0.47;
    const centerHoleRadius = size * 0.06;
    const logoRadius = size * 0.35;

    // Threshold for breaking into particles
    const BREAK_THRESHOLD = 0.15;

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      // Calculate RAW amplitude from audio data (no minimum floor)
      let rawAmplitude = 0;
      if (isActive && audioData && audioData.length > 0) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
          sum += audioData[i];
        }
        rawAmplitude = sum / audioData.length / 255;
      }

      // FAST smoothing - quick response to changes (both up AND down)
      // This creates the snappy "heartbeat" effect
      const smoothingUp = 0.3;    // Fast attack
      const smoothingDown = 0.25; // Fast decay for snappy return

      if (rawAmplitude > smoothedAmplitudeRef.current) {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * smoothingUp;
      } else {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * smoothingDown;
      }

      const amplitude = smoothedAmplitudeRef.current;

      // Dispersion based on amplitude - only when above threshold
      // 0 = solid logo, 1 = fully dispersed particles
      const dispersion = amplitude > BREAK_THRESHOLD
        ? Math.min(1, (amplitude - BREAK_THRESHOLD) * 3)
        : 0;

      // Expansion factor for particles
      const expansionFactor = 1 + dispersion * 0.8;

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring with wobble
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

      // SOLID LOGO when below threshold (dispersion near 0)
      if (dispersion < 0.15) {
        const logoSize = size * 0.70;
        const logoOffset = (size - logoSize) / 2;
        // Fade out solid logo as dispersion increases
        ctx.globalAlpha = 1 - (dispersion / 0.15);
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
        ctx.globalAlpha = 1;
      }

      // PARTICLES when above threshold
      if (dispersion > 0.05) {
        const particleAlpha = Math.min(1, dispersion * 3);

        for (const p of particles) {
          // Chaotic displacement
          const noiseX = noise(p.noiseOffsetX, p.noiseOffsetY, time * p.speed);
          const noiseY = noise(p.noiseOffsetY, p.noiseOffsetX, time * p.speed * 1.1);

          const chaosAmount = dispersion * 55;

          // Target position with expansion and chaos
          const expandedBaseX = p.baseX * expansionFactor;
          const expandedBaseY = p.baseY * expansionFactor;

          const targetX = expandedBaseX + noiseX * chaosAmount;
          const targetY = expandedBaseY + noiseY * chaosAmount;

          // FAST movement - snappy response
          const moveSpeed = 0.15;
          p.vx += (targetX - p.x) * moveSpeed;
          p.vy += (targetY - p.y) * moveSpeed;
          p.vx *= 0.85;
          p.vy *= 0.85;

          p.x += p.vx;
          p.y += p.vy;

          // Soft boundary
          const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
          const softMaxDist = ringRadius + (amplitude > 0.5 ? (amplitude - 0.5) * 40 : 0);

          if (distFromCenter > softMaxDist) {
            const angle = Math.atan2(p.y, p.x);
            const overflow = distFromCenter - softMaxDist;
            p.x -= Math.cos(angle) * overflow * 0.3;
            p.y -= Math.sin(angle) * overflow * 0.3;
          }

          // Center hole
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
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${particleAlpha})`;
          ctx.fill();
        }
      }

      // When dispersion is low, quickly return particles to base positions
      if (dispersion < 0.2) {
        const returnSpeed = 0.2; // Fast snap-back
        for (const p of particles) {
          p.x += (p.baseX - p.x) * returnSpeed;
          p.y += (p.baseY - p.y) * returnSpeed;
          p.vx *= 0.7;
          p.vy *= 0.7;
        }
      }

      // When not active at all, reset
      if (!isActive) {
        smoothedAmplitudeRef.current *= 0.85;
        for (const p of particles) {
          p.x += (p.baseX - p.x) * 0.15;
          p.y += (p.baseY - p.y) * 0.15;
        }
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
