"use client";

import { motion } from "framer-motion";

interface GlassPanelProps {
  children: React.ReactNode;
  highlighted?: boolean;
  className?: string;
  hover?: boolean;
}

export function GlassPanel({
  children,
  highlighted = false,
  className = "",
  hover = false,
}: GlassPanelProps) {
  const baseStyles = "glass-panel";
  const highlightStyles = highlighted ? "!border-accent-gold/50" : "";
  const hoverStyles = hover
    ? "transition-all duration-300 hover:translate-y-[-4px] hover:border-white/20"
    : "";

  return (
    <motion.div
      className={`${baseStyles} ${highlightStyles} ${hoverStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
