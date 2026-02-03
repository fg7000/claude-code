"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  color: string;
  vx: number;
  vy: number;
  size: number;
  audioOffset: number; // Random offset for audio reactivity
}

interface ParticleLogoProps {
  size?: number;
  particleCount?: number;
  isActive?: boolean; // When true, particles scatter and become audio-reactive
  audioData?: Uint8Array | null; // Audio frequency data
  className?: string;
}

export function ParticleLogo({
  size = 140,
  particleCount = 800,
  isActive = false,
  audioData = null,
  className = "",
}: ParticleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize particles from logo
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load the logo image
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/AgencerLogoSvg3.svg";
    });

    // Create a temporary canvas to sample the image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw logo to temp canvas
    tempCtx.drawImage(img, 0, 0, size, size);

    // Sample pixels to create particles
    const imageData = tempCtx.getImageData(0, 0, size, size);
    const pixels = imageData.data;
    const particles: Particle[] = [];
    const sampledPositions: { x: number; y: number; color: string }[] = [];

    // Collect all non-transparent pixels
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const alpha = pixels[i + 3];

        if (alpha > 50) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          sampledPositions.push({
            x,
            y,
            color: `rgb(${r}, ${g}, ${b})`,
          });
        }
      }
    }

    // Randomly select particles from sampled positions
    const step = Math.max(1, Math.floor(sampledPositions.length / particleCount));
    for (let i = 0; i < sampledPositions.length; i += step) {
      if (particles.length >= particleCount) break;

      const pos = sampledPositions[i];
      particles.push({
        x: pos.x,
        y: pos.y,
        homeX: pos.x,
        homeY: pos.y,
        color: pos.color,
        vx: 0,
        vy: 0,
        size: 1.5 + Math.random() * 1,
        audioOffset: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current = particles;
    setIsInitialized(true);
  }, [size, particleCount]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      const particles = particlesRef.current;
      const time = Date.now() * 0.001;

      // Get average audio level if available
      let audioLevel = 0;
      let bassLevel = 0;
      let midLevel = 0;
      let highLevel = 0;

      if (audioData && audioData.length > 0) {
        // Bass (0-10), Mid (10-100), High (100+)
        let bassSum = 0;
        let midSum = 0;
        let highSum = 0;
        const bassEnd = Math.min(10, audioData.length);
        const midEnd = Math.min(100, audioData.length);

        for (let i = 0; i < bassEnd; i++) bassSum += audioData[i];
        for (let i = bassEnd; i < midEnd; i++) midSum += audioData[i];
        for (let i = midEnd; i < audioData.length; i++) highSum += audioData[i];

        bassLevel = bassSum / bassEnd / 255;
        midLevel = midSum / (midEnd - bassEnd) / 255;
        highLevel = highSum / (audioData.length - midEnd) / 255;
        audioLevel = (bassLevel + midLevel + highLevel) / 3;
      }

      for (const particle of particles) {
        if (isActive) {
          // Scatter mode - particles move away from home and react to audio
          const angleFromCenter = Math.atan2(
            particle.homeY - centerY,
            particle.homeX - centerX
          );
          const distFromCenter = Math.sqrt(
            Math.pow(particle.homeX - centerX, 2) +
            Math.pow(particle.homeY - centerY, 2)
          );

          // Base scatter position
          const scatterDistance = 30 + distFromCenter * 0.5;
          const scatterX = particle.homeX + Math.cos(angleFromCenter) * scatterDistance;
          const scatterY = particle.homeY + Math.sin(angleFromCenter) * scatterDistance;

          // Audio reactivity - particles bounce based on frequency
          const particleFreqBand = (particle.audioOffset / (Math.PI * 2));
          let audioInfluence = 0;

          if (particleFreqBand < 0.33) {
            audioInfluence = bassLevel * 40;
          } else if (particleFreqBand < 0.66) {
            audioInfluence = midLevel * 30;
          } else {
            audioInfluence = highLevel * 25;
          }

          // Add oscillation and audio bounce
          const oscillation = Math.sin(time * 3 + particle.audioOffset) * 10;
          const audioBounce = Math.sin(time * 8 + particle.audioOffset) * audioInfluence;

          const targetX = scatterX + oscillation + Math.cos(angleFromCenter) * audioBounce;
          const targetY = scatterY + oscillation + Math.sin(angleFromCenter) * audioBounce;

          // Smooth movement towards target
          particle.vx += (targetX - particle.x) * 0.08;
          particle.vy += (targetY - particle.y) * 0.08;
          particle.vx *= 0.9;
          particle.vy *= 0.9;

          particle.x += particle.vx;
          particle.y += particle.vy;
        } else {
          // Reform mode - particles return home
          const dx = particle.homeX - particle.x;
          const dy = particle.homeY - particle.y;

          particle.vx += dx * 0.1;
          particle.vy += dy * 0.1;
          particle.vx *= 0.85;
          particle.vy *= 0.85;

          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        // Draw particle
        const alpha = isActive ? 0.8 + audioLevel * 0.2 : 1;
        const sizeMultiplier = isActive ? 1 + audioLevel * 0.5 : 1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * sizeMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
        ctx.fill();

        // Add glow effect when active
        if (isActive && audioLevel > 0.1) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * sizeMultiplier * 2, 0, Math.PI * 2);
          const glowAlpha = audioLevel * 0.3;
          ctx.fillStyle = particle.color.replace("rgb", "rgba").replace(")", `, ${glowAlpha})`);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isInitialized, isActive, audioData, size]);

  // Initialize on mount
  useEffect(() => {
    initParticles();
  }, [initParticles]);

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
