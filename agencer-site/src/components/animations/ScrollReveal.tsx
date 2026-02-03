"use client";

import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  distance = 30,
  stagger = 0.1,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !containerRef.current) {
      return;
    }

    const elements = containerRef.current.children;

    gsap.set(elements, {
      opacity: 0,
      y: distance,
    });

    const animation = gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: duration,
      stagger: stagger,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, [delay, duration, distance, stagger, once]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
