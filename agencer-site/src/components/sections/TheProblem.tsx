"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

export function TheProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  const lines = [
    "You pay for Claude. You pay for ChatGPT. You pay for Gemini.",
    "And then you spend your day copying between them.",
    "",
    "Re-explaining context. Switching tabs. Losing threads.",
    "Managing six tools that don't know about each other.",
    "",
    "This is the friction tax. Not money. Time.",
    "The most expensive thing you have.",
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=150%",
        pin: true,
        pinSpacing: true,
      });

      // Animate lines
      const lineElements = contentRef.current?.querySelectorAll(".reveal-line");
      if (lineElements && !prefersReducedMotion) {
        gsap.set(lineElements, { opacity: 0, y: 20 });

        lineElements.forEach((line, i) => {
          gsap.to(line, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${10 + i * 10}% top`,
              end: `${15 + i * 10}% top`,
              scrub: 1,
            },
          });
        });
      }

      // Animate tangled lines SVG
      if (linesRef.current && !prefersReducedMotion) {
        const paths = linesRef.current.querySelectorAll("path");
        paths.forEach((path, i) => {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${i * 5}% top`,
              end: `${20 + i * 5}% top`,
              scrub: 1,
            },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="the-problem"
      className="relative min-h-screen flex items-center justify-center bg-bg-primary overflow-hidden"
    >
      {/* Tangled lines background */}
      <svg
        ref={linesRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M100,200 Q300,100 500,300 T900,200"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M50,400 Q250,300 450,500 T850,400"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M150,600 Q350,500 550,700 T950,600"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M0,800 Q200,700 400,900 T800,800"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M200,100 Q400,200 300,400 T600,500 Q800,600 700,800"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M800,100 Q600,200 700,400 T400,500 Q200,600 300,800"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M500,50 Q300,250 500,450 T500,850"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        <path
          d="M100,500 Q300,300 500,500 T900,500"
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
      </svg>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-[800px] mx-auto px-6 text-center"
      >
        <SectionLabel>The Tax</SectionLabel>

        <h2
          className="font-serif font-medium text-text-headline mb-12"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          You&apos;re paying a tax you didn&apos;t agree to.
        </h2>

        <div className="space-y-4">
          {lines.map((line, i) =>
            line === "" ? (
              <div key={i} className="h-6" />
            ) : (
              <p
                key={i}
                className="reveal-line font-sans text-text-secondary leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
              >
                {line}
              </p>
            )
          )}
        </div>
      </div>
    </section>
  );
}
