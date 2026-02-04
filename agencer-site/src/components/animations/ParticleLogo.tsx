"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: { r: number; g: number; b: number };
  size: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
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
  const timeRef = useRef(0);
  const dispersionRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store audioData and isActive in refs so animation loop can access latest values
  const audioDataRef = useRef<Uint8Array | null>(null);
  const isActiveRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Noise for chaotic motion
  const noise = useCallback((x: number, y: number, time: number): number => {
    return Math.sin(x * 0.02 + time) * Math.cos(y * 0.02 + time * 0.7) +
           Math.sin(x * 0.05 - time * 1.3) * Math.cos(y * 0.03 + time * 0.5);
  }, []);

  // Initialize particles
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/AgencerLogoSvg3.svg";
    });

    logoImageRef.current = img;

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
      particles.push({
        x: pos.x,
        y: pos.y,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 0.3 + Math.random() * 0.25,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.5 + Math.random() * 1.0,
      });
    }

    particlesRef.current = particles;
    setIsInitialized(true);
  }, [size, dpr]);

  // Animation loop - runs once, reads from refs
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

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      // Read current values from refs (not props)
      const currentAudioData = audioDataRef.current;
      const currentIsActive = isActiveRef.current;

      // Calculate amplitude
      let rawAmplitude = 0;
      if (currentIsActive && currentAudioData && currentAudioData.length > 0) {
        let sum = 0;
        for (let i = 0; i < currentAudioData.length; i++) {
          sum += currentAudioData[i];
        }
        rawAmplitude = sum / currentAudioData.length / 255;
      }

      // Determine if we should show particles or solid logo
      const threshold = 0.06;
      const shouldDisperse = rawAmplitude > threshold;

      // INSTANT transitions - no smoothing
      if (shouldDisperse) {
        // Instantly set dispersion based on amplitude
        dispersionRef.current = Math.min(1, (rawAmplitude - threshold) * 4);
      } else {
        // Instantly snap back to solid
        dispersionRef.current = 0;
      }

      const dispersion = dispersionRef.current;
      const expansionFactor = 1 + dispersion * 0.8;

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring
      ctx.save();
      ctx.beginPath();

      const wobbleAmount = 1.5 + dispersion * 4;
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
      ctx.lineWidth = 2.5 + dispersion * 2;
      ctx.stroke();
      ctx.restore();

      // SOLID LOGO when not dispersed
      if (dispersion < 0.5) {
        const logoSize = size * 0.70;
        const logoOffset = (size - logoSize) / 2;
        ctx.globalAlpha = 1 - dispersion * 2;
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
        ctx.globalAlpha = 1;
      }

      // PARTICLES when dispersed
      if (dispersion > 0) {
        const particleAlpha = Math.min(1, dispersion * 2);

        for (const p of particles) {
          const noiseX = noise(p.noiseOffsetX, p.noiseOffsetY, time * p.speed);
          const noiseY = noise(p.noiseOffsetY, p.noiseOffsetX, time * p.speed * 1.1);

          const chaosAmount = dispersion * 50;

          const dispersedX = p.baseX * expansionFactor + noiseX * chaosAmount;
          const dispersedY = p.baseY * expansionFactor + noiseY * chaosAmount;

          p.x = p.baseX + (dispersedX - p.baseX) * dispersion;
          p.y = p.baseY + (dispersedY - p.baseY) * dispersion;

          const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
          const softMaxDist = ringRadius + dispersion * 20;

          if (distFromCenter > softMaxDist) {
            const angle = Math.atan2(p.y, p.x);
            p.x = Math.cos(angle) * softMaxDist;
            p.y = Math.sin(angle) * softMaxDist;
          }

          if (distFromCenter < centerHoleRadius && dispersion > 0.3) {
            const angle = Math.atan2(p.y, p.x);
            const push = (1 - distFromCenter / centerHoleRadius) * dispersion * 10;
            p.x += Math.cos(angle) * push;
            p.y += Math.sin(angle) * push;
          }

          ctx.beginPath();
          ctx.arc(centerX + p.x, centerY + p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${particleAlpha})`;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isInitialized, size, dpr, noise]); // Removed audioData and isActive - using refs instead

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
