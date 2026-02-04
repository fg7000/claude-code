"use client";

import { useRef, useEffect, useCallback } from "react";

export type EffectType = "breathe" | "shimmer" | "turbulence" | "ripple" | "glow";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: { r: number; g: number; b: number };
  size: number;
  distFromCenter: number;
  angle: number;
  // For ambient breathing
  phaseX: number;
  phaseY: number;
  glowPhase: number;
  // For orbital effect
  orbitalVelocity: number;
  orbitalAngle: number;
  orbitalRadius: number;
  // For displacement
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  // For brightness
  brightness: number;
  targetBrightness: number;
}

interface Wave {
  radius: number;
  opacity: number;
  speed: number;
}

interface ParticleLogoEffectProps {
  size?: number;
  effect: EffectType;
  audioData: {
    amplitude: number;
    frequencies: Float32Array | null;
    isOnset: boolean;
  };
  className?: string;
}

export function ParticleLogoEffect({
  size = 180,
  effect,
  audioData,
  className = "",
}: ParticleLogoEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const animationRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const smoothedAmplitudeRef = useRef(0);
  const prevAmplitudeRef = useRef(0);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Initialize particles from logo
  const initParticles = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    // Set canvas size with device pixel ratio for crisp rendering
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Create trail canvas with same scaling
    const trailCanvas = document.createElement("canvas");
    trailCanvas.width = size * dpr;
    trailCanvas.height = size * dpr;
    const trailCtxInit = trailCanvas.getContext("2d");
    if (trailCtxInit) trailCtxInit.scale(dpr, dpr);
    trailCanvasRef.current = trailCanvas;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "/AgencerLogoSvg3.svg";
    });

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0, size, size);
    const imageData = tempCtx.getImageData(0, 0, size, size);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    const centerX = size / 2;
    const centerY = size / 2;

    // High density sampling - collect all colored pixels
    const allPositions: { x: number; y: number; r: number; g: number; b: number }[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const alpha = pixels[i + 3];
        if (alpha > 30) {
          allPositions.push({
            x: x - centerX,
            y: y - centerY,
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
          });
        }
      }
    }

    // Target ~8000 particles for ultra high fidelity
    const targetCount = 8000;
    const step = Math.max(1, Math.floor(allPositions.length / targetCount));

    for (let i = 0; i < allPositions.length; i += step) {
      const pos = allPositions[i];
      const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      const angle = Math.atan2(pos.y, pos.x);

      particles.push({
        x: pos.x,
        y: pos.y,
        baseX: pos.x,
        baseY: pos.y,
        color: { r: pos.r, g: pos.g, b: pos.b },
        size: 0.6 + Math.random() * 0.4,
        distFromCenter: dist,
        angle: angle,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        glowPhase: Math.random() * Math.PI * 2,
        orbitalVelocity: 0.0005 + Math.random() * 0.001,
        orbitalAngle: angle,
        orbitalRadius: dist,
        vx: 0,
        vy: 0,
        targetX: pos.x,
        targetY: pos.y,
        brightness: 0.6,
        targetBrightness: 0.6,
      });
    }

    particlesRef.current = particles;
    isInitializedRef.current = true;
  }, [size, dpr]);

  // Animation loop
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const canvas = canvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!canvas || !trailCanvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const trailCtx = trailCanvas.getContext("2d");
    if (!ctx || !trailCtx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxDist = size * 0.45;
    const scaledSize = size * dpr;

    const animate = () => {
      const time = Date.now() * 0.001;
      const particles = particlesRef.current;
      const waves = wavesRef.current;

      // Smooth amplitude
      const targetAmplitude = audioData.amplitude;
      smoothedAmplitudeRef.current += (targetAmplitude - smoothedAmplitudeRef.current) * 0.15;
      const amplitude = smoothedAmplitudeRef.current;

      // Detect onset for wave effect
      if (audioData.isOnset && waves.length < 6) {
        waves.push({ radius: 0, opacity: 0.8, speed: 4 });
      }

      // Update waves
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].radius += waves[i].speed;
        waves[i].opacity -= 0.015;
        if (waves[i].opacity <= 0 || waves[i].radius > size) {
          waves.splice(i, 1);
        }
      }

      // Apply trail effect - fade previous frame
      trailCtx.fillStyle = "rgba(10, 10, 10, 0.88)";
      trailCtx.fillRect(0, 0, size, size);

      // Get frequency bands if available
      const freqBands = { bass: 0, lowMid: 0, mid: 0, highMid: 0, high: 0 };
      if (audioData.frequencies && audioData.frequencies.length > 0) {
        const freq = audioData.frequencies;
        const len = freq.length;
        const bandSize = Math.floor(len / 5);

        for (let i = 0; i < bandSize; i++) freqBands.bass += (freq[i] + 140) / 140;
        for (let i = bandSize; i < bandSize * 2; i++) freqBands.lowMid += (freq[i] + 140) / 140;
        for (let i = bandSize * 2; i < bandSize * 3; i++) freqBands.mid += (freq[i] + 140) / 140;
        for (let i = bandSize * 3; i < bandSize * 4; i++) freqBands.highMid += (freq[i] + 140) / 140;
        for (let i = bandSize * 4; i < len; i++) freqBands.high += (freq[i] + 140) / 140;

        freqBands.bass /= bandSize;
        freqBands.lowMid /= bandSize;
        freqBands.mid /= bandSize;
        freqBands.highMid /= bandSize;
        freqBands.high /= (len - bandSize * 4);
      }

      // Update particles based on effect
      for (const p of particles) {
        // Ambient breathing (always active)
        const ambientX = Math.sin(time * 0.5 + p.phaseX) * 0.8;
        const ambientY = Math.cos(time * 0.4 + p.phaseY) * 0.8;
        const ambientGlow = 0.6 + Math.sin(time * 0.3 + p.glowPhase) * 0.1;

        let effectX = 0;
        let effectY = 0;
        let effectBrightness = ambientGlow;

        switch (effect) {
          case "breathe": {
            // Expand outward from center based on amplitude
            const expansion = 1 + amplitude * 0.35;
            const targetX = p.baseX * expansion;
            const targetY = p.baseY * expansion;
            effectX = targetX - p.baseX;
            effectY = targetY - p.baseY;
            effectBrightness = 0.5 + amplitude * 0.5;
            break;
          }

          case "shimmer": {
            // Map particle to frequency band based on distance
            const normalizedDist = p.distFromCenter / maxDist;
            let bandEnergy = 0;
            let jitterSpeed = 0.1;
            let jitterAmount = 3;

            if (normalizedDist > 0.7) {
              bandEnergy = freqBands.bass;
              jitterSpeed = 0.05;
              jitterAmount = 8;
            } else if (normalizedDist > 0.5) {
              bandEnergy = freqBands.lowMid;
              jitterSpeed = 0.08;
              jitterAmount = 6;
            } else if (normalizedDist > 0.3) {
              bandEnergy = freqBands.mid;
              jitterSpeed = 0.15;
              jitterAmount = 4;
            } else if (normalizedDist > 0.15) {
              bandEnergy = freqBands.highMid;
              jitterSpeed = 0.25;
              jitterAmount = 3;
            } else {
              bandEnergy = freqBands.high;
              jitterSpeed = 0.35;
              jitterAmount = 2;
            }

            const angle = Math.random() * Math.PI * 2;
            const targetDisp = bandEnergy * jitterAmount;
            effectX = Math.cos(angle) * targetDisp;
            effectY = Math.sin(angle) * targetDisp;

            // Lerp toward target
            p.vx += (effectX - p.vx) * jitterSpeed;
            p.vy += (effectY - p.vy) * jitterSpeed;
            effectX = p.vx;
            effectY = p.vy;
            effectBrightness = 0.4 + bandEnergy * 0.6;
            break;
          }

          case "turbulence": {
            // Update orbital angle
            const velocityBoost = amplitude * 0.015;
            p.orbitalAngle += p.orbitalVelocity + velocityBoost;

            // Perturb radius
            const radiusNoise = (Math.sin(time * 2 + p.phaseX) * 0.5 + 0.5) * amplitude * 12;
            const currentRadius = p.orbitalRadius + radiusNoise;

            // Calculate orbital position
            const orbX = Math.cos(p.orbitalAngle) * currentRadius;
            const orbY = Math.sin(p.orbitalAngle) * currentRadius;

            // Blend between base position and orbital
            const orbitAmount = amplitude * 0.8;
            effectX = (orbX - p.baseX) * orbitAmount;
            effectY = (orbY - p.baseY) * orbitAmount;

            // Clamp max displacement
            const maxDisp = 40;
            const dispDist = Math.sqrt(effectX * effectX + effectY * effectY);
            if (dispDist > maxDisp) {
              effectX = (effectX / dispDist) * maxDisp;
              effectY = (effectY / dispDist) * maxDisp;
            }
            effectBrightness = 0.5 + amplitude * 0.4;
            break;
          }

          case "ripple": {
            // Check if any wave is passing through this particle
            let waveDisp = 0;
            for (const wave of waves) {
              const distToWave = Math.abs(p.distFromCenter - wave.radius);
              if (distToWave < 15) {
                const waveStrength = (1 - distToWave / 15) * wave.opacity;
                waveDisp += waveStrength * 8;
              }
            }

            // Displace outward along angle
            const targetDispX = Math.cos(p.angle) * waveDisp;
            const targetDispY = Math.sin(p.angle) * waveDisp;

            // Spring back
            p.vx += (targetDispX - p.vx) * 0.15;
            p.vy += (targetDispY - p.vy) * 0.15;
            p.vx *= 0.92;
            p.vy *= 0.92;

            effectX = p.vx;
            effectY = p.vy;
            effectBrightness = 0.5 + waveDisp * 0.05;
            break;
          }

          case "glow": {
            // Minimal movement - just tiny scatter on peaks
            if (audioData.isOnset) {
              const scatterAngle = Math.random() * Math.PI * 2;
              const scatterDist = 1 + Math.random() * 2;
              p.targetX = p.baseX + Math.cos(scatterAngle) * scatterDist;
              p.targetY = p.baseY + Math.sin(scatterAngle) * scatterDist;
            }

            // Spring back quickly
            p.vx += (p.targetX - (p.baseX + p.vx)) * 0.2;
            p.vy += (p.targetY - (p.baseY + p.vy)) * 0.2;
            p.vx *= 0.85;
            p.vy *= 0.85;

            effectX = p.vx;
            effectY = p.vy;

            // Strong brightness response
            p.targetBrightness = 0.4 + amplitude * 0.6;
            if (audioData.isOnset) p.targetBrightness = 1.0;
            p.brightness += (p.targetBrightness - p.brightness) * 0.3;
            effectBrightness = p.brightness;
            break;
          }
        }

        // Apply final position
        if (effect !== "shimmer" && effect !== "ripple") {
          p.x = p.baseX + effectX + ambientX;
          p.y = p.baseY + effectY + ambientY;
        } else {
          p.x = p.baseX + effectX + ambientX * 0.3;
          p.y = p.baseY + effectY + ambientY * 0.3;
        }

        // Draw particle as crisp small dot
        const drawX = centerX + p.x;
        const drawY = centerY + p.y;
        const alpha = Math.min(1, effectBrightness + 0.3);

        // Draw single crisp dot - no glow for maximum clarity
        trailCtx.beginPath();
        trailCtx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        trailCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
        trailCtx.fill();
      }

      // Copy trail canvas to main canvas
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(trailCanvas, 0, 0, size, size);

      prevAmplitudeRef.current = amplitude;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [effect, audioData, size, dpr]);

  // Initialize
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
