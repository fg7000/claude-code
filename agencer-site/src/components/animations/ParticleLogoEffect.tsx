"use client";

import { useRef, useEffect, useCallback, useState } from "react";

export type EffectType = "breathe" | "shimmer" | "turbulence" | "ripple" | "glow";

interface Particle {
  x: number;
  y: number;
  z: number; // 3D depth
  baseX: number;
  baseY: number;
  color: { r: number; g: number; b: number };
  size: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  noiseOffsetZ: number;
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
  // Smooth amplitude envelope - this is key for fluid motion
  const smoothedAmplitudeRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Store audioData in ref
  const audioDataRef = useRef(audioData);
  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // 3D Simplex-like noise function for organic motion
  const noise3D = useCallback((x: number, y: number, z: number, time: number): { x: number; y: number; z: number } => {
    // Multi-octave 3D noise for curl-like behavior
    const scale1 = 0.008;
    const scale2 = 0.015;
    const scale3 = 0.025;

    const nx =
      Math.sin(x * scale1 + time * 0.5) * Math.cos(y * scale1 + time * 0.3) * Math.sin(z * scale1 + time * 0.4) +
      Math.sin(x * scale2 - time * 0.7) * Math.cos(y * scale2 + time * 0.5) * 0.5 +
      Math.sin(x * scale3 + time * 0.9) * Math.cos(z * scale3 - time * 0.6) * 0.25;

    const ny =
      Math.cos(x * scale1 + time * 0.4) * Math.sin(y * scale1 - time * 0.5) * Math.cos(z * scale1 + time * 0.3) +
      Math.cos(x * scale2 + time * 0.6) * Math.sin(y * scale2 - time * 0.4) * 0.5 +
      Math.cos(y * scale3 - time * 0.8) * Math.sin(z * scale3 + time * 0.5) * 0.25;

    const nz =
      Math.sin(x * scale1 - time * 0.3) * Math.sin(y * scale1 + time * 0.6) * Math.cos(z * scale1 - time * 0.5) +
      Math.sin(y * scale2 + time * 0.5) * Math.cos(z * scale2 - time * 0.7) * 0.5 +
      Math.cos(x * scale3 + time * 0.4) * Math.sin(y * scale3 - time * 0.3) * 0.25;

    return { x: nx, y: ny, z: nz };
  }, []);

  // Initialize particles
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

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

    const targetCount = 60000;
    const step = Math.max(1, Math.floor(allPositions.length / targetCount));

    for (let i = 0; i < allPositions.length; i += step) {
      const pos = allPositions[i];
      particles.push({
        x: pos.x,
        y: pos.y,
        z: 0,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 0.4 + Math.random() * 0.3,
        noiseOffsetX: Math.random() * 500,
        noiseOffsetY: Math.random() * 500,
        noiseOffsetZ: Math.random() * 500,
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
    const centerHoleRadius = size * 0.05;

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const particles = particlesRef.current;

      // Get current amplitude
      const rawAmplitude = audioDataRef.current.amplitude;

      // SMOOTH amplitude envelope - this creates the fluid, synced feel
      // Fast attack, medium release for natural voice following
      const attackSpeed = 0.25;  // How fast to respond to sound
      const releaseSpeed = 0.08; // How fast to decay (slower = smoother)

      if (rawAmplitude > smoothedAmplitudeRef.current) {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * attackSpeed;
      } else {
        smoothedAmplitudeRef.current += (rawAmplitude - smoothedAmplitudeRef.current) * releaseSpeed;
      }

      const amplitude = smoothedAmplitudeRef.current;

      // Noise strength and displacement modulated by amplitude
      // Even at 0 amplitude, there's subtle movement (particles feel alive)
      const baseNoiseStrength = 3; // Always some subtle movement
      const audioNoiseStrength = amplitude * 80; // Audio adds more
      const noiseStrength = baseNoiseStrength + audioNoiseStrength;

      // Dispersion/expansion also modulated by amplitude
      const expansion = 1 + amplitude * 0.6;

      // Clear canvas
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Draw rainbow ring
      ctx.save();
      ctx.beginPath();

      const wobbleAmount = 1 + amplitude * 6;
      const wobbleFreq = 5;
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
        const wobble = Math.sin(angle * wobbleFreq + time * 2) * wobbleAmount;
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
      ctx.lineWidth = 2 + amplitude * 3;
      ctx.stroke();
      ctx.restore();

      // Draw solid logo when amplitude is very low (fades based on amplitude)
      const logoOpacity = Math.max(0, 1 - amplitude * 8);
      if (logoOpacity > 0.01) {
        const logoSize = size * 0.70;
        const logoOffset = (size - logoSize) / 2;
        ctx.globalAlpha = logoOpacity;
        ctx.drawImage(logoImg, logoOffset, logoOffset, logoSize, logoSize);
        ctx.globalAlpha = 1;
      }

      // Draw particles - always visible, intensity varies with amplitude
      const particleOpacity = Math.min(1, 0.3 + amplitude * 3);

      for (const p of particles) {
        // Get 3D noise displacement
        const noiseResult = noise3D(
          p.noiseOffsetX + p.baseX,
          p.noiseOffsetY + p.baseY,
          p.noiseOffsetZ,
          time * 0.8
        );

        // Apply noise displacement modulated by amplitude
        const dx = noiseResult.x * noiseStrength;
        const dy = noiseResult.y * noiseStrength;
        p.z = noiseResult.z * noiseStrength * 0.5; // Z for size variation

        // Calculate position with expansion
        p.x = p.baseX * expansion + dx;
        p.y = p.baseY * expansion + dy;

        // Soft boundary at ring
        const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y);
        const maxDist = ringRadius + amplitude * 30;

        if (distFromCenter > maxDist) {
          const angle = Math.atan2(p.y, p.x);
          const pushBack = (distFromCenter - maxDist) * 0.5;
          p.x -= Math.cos(angle) * pushBack;
          p.y -= Math.sin(angle) * pushBack;
        }

        // Center hole
        if (distFromCenter < centerHoleRadius) {
          const angle = Math.atan2(p.y, p.x);
          const push = (centerHoleRadius - distFromCenter) * 0.8;
          p.x += Math.cos(angle) * push;
          p.y += Math.sin(angle) * push;
        }

        // Size varies with Z depth and amplitude
        const depthScale = 1 + p.z * 0.02;
        const drawSize = p.size * depthScale * (0.8 + amplitude * 0.4);

        // Draw particle
        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${particleOpacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isLoaded, size, dpr, noise3D]);

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
