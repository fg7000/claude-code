"use client";

interface LogoMarqueeProps {
  items: string[];
  direction?: "left" | "right";
  speed?: "normal" | "slow";
  className?: string;
}

export function LogoMarquee({
  items,
  direction = "left",
  speed = "normal",
  className = "",
}: LogoMarqueeProps) {
  const animationClass =
    direction === "left"
      ? speed === "slow"
        ? "marquee-left-slow"
        : "marquee-left"
      : speed === "slow"
      ? "marquee-right-slow"
      : "marquee-right";

  // Duplicate items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`flex gap-4 ${animationClass}`} style={{ width: "max-content" }}>
        {allItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex-shrink-0 px-4 py-2 rounded-full border border-glass-border bg-glass-bg text-sm text-text-secondary/40 hover:text-text-secondary/70 hover:border-glass-border transition-all duration-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
