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

  // Simple noise function for chaotic motion
  const noise = useCallback((x: number, y: number, time: number): number => {
    return Math.sin(x * 0.02 + time) * Math.cos(y * 0.02 + time * 0.7) +
           Math.sin(x * 0.05 - time * 1.3) * Math.cos(y * 0.03 + time * 0.5);
  }, []);

  // Initialize particles from logo
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with device pixel ratio for crisp rendering
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

    // Sample at high resolution for accurate particle positions
    const sampleSize = 800;
    const scaleFactor = size / sampleSize;

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

    // Collect all colored pixels
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

    // Target 80000 particles for ultra-fine stipple effect
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
        size: 0.3 + Math.random() * 0.25, // Very small particles
        vx: 0,
        vy: 0,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.3 + Math.random() * 1.2,
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
    const ringRadius = size * 0.44;
    const centerHoleRadius = size * 0.08;

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
      smoothedAmplitudeRef.current += (targetAmplitude - smoothedAmplitudeRef.current) * 0.15;
      const amplitude = isActive ? Math.max(0.3, smoothedAmplitudeRef.current) : smoothedAmplitudeRef.current;

      // Dispersion: 0 = solid logo, 1 = fully dispersed
      const dispersion = isActive ? Math.min(1, amplitude * 2.5) : 0;

      // Clear canvas (reset transform first)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring with subtle wobble (always visible)
      ctx.save();
      ctx.beginPath();

      const wobbleAmount = 2 + amplitude * 3;
      const wobbleFreq = 8;
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        const wobble = Math.sin(angle * wobbleFreq + time * 2) * wobbleAmount * 0.3;
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

      // Rainbow gradient matching the video
      const ringGradient = ctx.createConicGradient(0, centerX, centerY);
      ringGradient.addColorStop(0, "rgba(0, 200, 255, 0.85)");
      ringGradient.addColorStop(0.12, "rgba(0, 100, 255, 0.85)");
      ringGradient.addColorStop(0.25, "rgba(100, 0, 255, 0.85)");
      ringGradient.addColorStop(0.37, "rgba(255, 0, 200, 0.85)");
      ringGradient.addColorStop(0.5, "rgba(255, 0, 100, 0.85)");
      ringGradient.addColorStop(0.62, "rgba(255, 150, 0, 0.85)");
      ringGradient.addColorStop(0.75, "rgba(255, 255, 0, 0.85)");
      ringGradient.addColorStop(0.87, "rgba(0, 255, 100, 0.85)");
      ringGradient.addColorStop(1, "rgba(0, 200, 255, 0.85)");
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 3 + amplitude * 2;
      ctx.stroke();
      ctx.restore();

      // If not active or low dispersion, draw solid logo
      if (dispersion < 0.1) {
        const logoSize = size * 0.78;
        const logoOffset = (size - logoSize) / 2;
        ctx.globalAlpha = 1 - dispersion * 10;
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
        ctx.globalAlpha = 1;
      }

      // Draw particles when dispersed
      if (dispersion > 0.05) {
        const particleAlpha = Math.min(1, dispersion * 1.8);

        for (const p of particles) {
          // Chaotic noise-based displacement
          const noiseX = noise(p.noiseOffsetX, p.noiseOffsetY, time * p.speed);
          const noiseY = noise(p.noiseOffsetY, p.noiseOffsetX, time * p.speed * 1.1);

          const maxDisp = dispersion * 45;

          const targetX = p.baseX + noiseX * maxDisp;
          const targetY = p.baseY + noiseY * maxDisp;

          // Smooth movement
          p.vx += (targetX - p.x) * 0.1;
          p.vy += (targetY - p.y) * 0.1;
          p.vx *= 0.9;
          p.vy *= 0.9;

          p.x = p.baseX + p.vx * dispersion;
          p.y = p.baseY + p.vy * dispersion;

          // Constrain within ring
          const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
          const maxDist = ringRadius - 8;

          if (distFromCenter > maxDist) {
            const angle = Math.atan2(p.y, p.x);
            p.x = Math.cos(angle) * maxDist;
            p.y = Math.sin(angle) * maxDist;
          }

          // Preserve center hole
          if (distFromCenter < centerHoleRadius && dispersion > 0.3) {
            const angle = Math.atan2(p.y, p.x);
            const pushFactor = (1 - distFromCenter / centerHoleRadius) * dispersion;
            p.x += Math.cos(angle) * pushFactor * 15;
            p.y += Math.sin(angle) * pushFactor * 15;
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

      // Return particles to base when not active
      if (!isActive) {
        for (const p of particles) {
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.x += (p.baseX - p.x) * 0.1;
          p.y += (p.baseY - p.y) * 0.1;
        }
        smoothedAmplitudeRef.current *= 0.95;
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
