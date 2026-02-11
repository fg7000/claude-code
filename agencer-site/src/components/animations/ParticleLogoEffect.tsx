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
  // Random orbit parameters - each particle moves independently like balls in a washing machine
  speedX: number;
  speedY: number;
  speedZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
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

    // Moderate particle count for visible gaps
    const targetCount = 12000;
    const step = Math.max(1, Math.floor(allPositions.length / targetCount));

    for (let i = 0; i < allPositions.length; i += step) {
      const pos = allPositions[i];

      // Each particle gets COMPLETELY RANDOM orbit parameters
      // Circular orbits with varying sizes and speeds for swirling effect
      particles.push({
        x: pos.x,
        y: pos.y,
        z: 0,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 1.0 + Math.random() * 0.6,
        // Orbital speeds - some fast, some slow, some clockwise, some counter-clockwise
        speedX: (0.3 + Math.random() * 1.2) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (0.3 + Math.random() * 1.2) * (Math.random() > 0.5 ? 1 : -1),
        speedZ: (0.2 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1),
        // Random starting phase
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        // Orbit radius - how big the circular path is
        radiusX: 0.5 + Math.random() * 1.0,
        radiusY: 0.5 + Math.random() * 1.0,
        radiusZ: 0.3 + Math.random() * 0.7,
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
    const centerHoleRadius = size * 0.03;

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      const rawAmplitude = audioDataRef.current.amplitude;

      // Snappy response
      const attackSpeed = 0.5;
      const releaseSpeed = 0.4;

      if (rawAmplitude > smoothedAmplitudeRef.current) {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * attackSpeed;
      } else {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * releaseSpeed;
      }

      const amplitude = smoothedAmplitudeRef.current;

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring
      ctx.save();
      ctx.beginPath();
      const wobbleAmount = 1 + amplitude * 8;
      const wobbleFreq = 5;
      for (let a = 0; a <= Math.PI * 2; a += 0.02) {
        const wobble = Math.sin(a * wobbleFreq + time * 2) * wobbleAmount;
        const r = ringRadius + wobble;
        const x = centerX + Math.cos(a) * r;
        const y = centerY + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
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

      const threshold = 0.05;

      if (amplitude < threshold) {
        // SOLID LOGO when silent
        const logoSize = size * 0.70;
        const logoOffset = (size - logoSize) / 2;
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
      } else {
        // PARTICLES - "washing machine" random 3D motion
        const normalizedAmp = Math.min(1, (amplitude - threshold) / 0.5);

        // How far particles can drift from home - increases with amplitude
        const maxDrift = normalizedAmp * 60;

        // Collect particles with their Z for depth sorting
        const particleData: { p: Particle; drawX: number; drawY: number; drawZ: number; drawSize: number }[] = [];

        for (const p of particles) {
          // TRUE CIRCULAR ORBIT - each particle swirls around its home position
          // Using sin/cos pair creates actual circular motion, not back-and-forth
          const angle1 = time * p.speedX + p.phaseX;
          const angle2 = time * p.speedY + p.phaseY;
          const angle3 = time * p.speedZ + p.phaseZ;

          // Circular motion in XY plane + secondary wobble for complexity
          const orbitX = Math.cos(angle1) * p.radiusX + Math.sin(angle2 * 0.7) * p.radiusY * 0.3;
          const orbitY = Math.sin(angle1) * p.radiusX + Math.cos(angle2 * 0.7) * p.radiusY * 0.3;
          const orbitZ = Math.sin(angle3) * p.radiusZ;

          // Position = base position + circular orbit * drift amount
          const drawX = p.baseX + orbitX * maxDrift;
          const drawY = p.baseY + orbitY * maxDrift;
          const drawZ = orbitZ * maxDrift;

          // Soft boundary - keep particles roughly within ring
          let finalX = drawX;
          let finalY = drawY;
          const dist = Math.sqrt(finalX * finalX + finalY * finalY);
          const maxAllowed = ringRadius - 8;

          if (dist > maxAllowed) {
            const scale = maxAllowed / dist;
            finalX *= scale;
            finalY *= scale;
          }

          // Keep center hole clear
          if (dist < centerHoleRadius && dist > 0) {
            const scale = centerHoleRadius / dist;
            finalX *= scale;
            finalY *= scale;
          }

          // Size varies with depth (closer = bigger)
          const depthFactor = 1 + (drawZ / 60) * 0.4;
          const drawSize = Math.max(0.6, p.size * depthFactor);

          particleData.push({ p, drawX: finalX, drawY: finalY, drawZ, drawSize });
        }

        // Sort by Z (back to front) for proper depth
        particleData.sort((a, b) => a.drawZ - b.drawZ);

        // Draw particles
        for (const { p, drawX, drawY, drawZ, drawSize } of particleData) {
          // Slight opacity variation with depth
          const opacity = 0.75 + (drawZ / 60 + 0.5) * 0.25;

          ctx.beginPath();
          ctx.arc(centerX + drawX, centerY + drawY, drawSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.min(1, opacity)})`;
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
