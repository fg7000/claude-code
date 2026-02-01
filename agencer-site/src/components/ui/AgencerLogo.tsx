"use client";

interface AgencerLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function AgencerLogo({ size = 48, className = "", animate = true }: AgencerLogoProps) {
  return (
    <div
      className={`relative ${animate ? "gradient-border" : ""} rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-[2px] rounded-full bg-bg-primary"
        style={{
          background: `conic-gradient(from 0deg, var(--gradient-start), var(--gradient-mid), var(--gradient-end), var(--gradient-start))`,
        }}
      />
      <div
        className="absolute inset-[3px] rounded-full bg-bg-primary"
      />
      <div
        className="absolute inset-[4px] rounded-full"
        style={{
          background: `conic-gradient(from 45deg, var(--gradient-start), var(--gradient-mid), var(--gradient-end), var(--gradient-start))`,
          opacity: 0.8,
        }}
      />
    </div>
  );
}
