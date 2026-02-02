"use client";

import { useMemo } from "react";

interface FloatingDotsProps {
  count?: number;
  className?: string;
}

// Agencer logo spectrum colors
const LOGO_COLORS = [
  "var(--logo-amber)",
  "var(--logo-copper)",
  "var(--logo-rose)",
  "var(--logo-violet)",
  "var(--logo-indigo)",
  "var(--logo-blue)",
  "var(--logo-teal)",
];

// Seeded random for consistent SSR/client rendering
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function FloatingDots({ count = 20, className = "" }: FloatingDotsProps) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 1000;
      const size = 2 + seededRandom(seed) * 4; // 2-6px
      const left = seededRandom(seed + 1) * 100;
      const top = seededRandom(seed + 2) * 100;
      const opacity = 0.2 + seededRandom(seed + 3) * 0.3; // 0.2-0.5
      const color = LOGO_COLORS[Math.floor(seededRandom(seed + 4) * LOGO_COLORS.length)];
      const animationClass = `float-${(i % 3) + 1}`;
      const animationDelay = seededRandom(seed + 5) * -20; // Offset animation start
      const hasGlow = seededRandom(seed + 6) > 0.6; // 40% chance of glow

      return {
        id: i,
        size,
        left,
        top,
        opacity,
        color,
        animationClass,
        animationDelay,
        hasGlow,
      };
    });
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-[1] ${className}`}>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={dot.animationClass}
          style={{
            position: "absolute",
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            backgroundColor: dot.color,
            borderRadius: "50%",
            opacity: dot.opacity,
            animationDelay: `${dot.animationDelay}s`,
            boxShadow: dot.hasGlow ? `0 0 ${dot.size * 2}px ${dot.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// A section-specific version with relative positioning
export function FloatingDotsSection({ count = 15, className = "" }: FloatingDotsProps) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 1000 + 500; // Different seed from global version
      const size = 2 + seededRandom(seed) * 4;
      const left = seededRandom(seed + 1) * 100;
      const top = seededRandom(seed + 2) * 100;
      const opacity = 0.2 + seededRandom(seed + 3) * 0.3;
      const color = LOGO_COLORS[Math.floor(seededRandom(seed + 4) * LOGO_COLORS.length)];
      const animationClass = `float-${(i % 3) + 1}`;
      const animationDelay = seededRandom(seed + 5) * -20;
      const hasGlow = seededRandom(seed + 6) > 0.6;

      return {
        id: i,
        size,
        left,
        top,
        opacity,
        color,
        animationClass,
        animationDelay,
        hasGlow,
      };
    });
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={dot.animationClass}
          style={{
            position: "absolute",
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            backgroundColor: dot.color,
            borderRadius: "50%",
            opacity: dot.opacity,
            animationDelay: `${dot.animationDelay}s`,
            boxShadow: dot.hasGlow ? `0 0 ${dot.size * 2}px ${dot.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}
