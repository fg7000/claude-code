"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// Globe colors from Agencer spectrum
const nodeColors = [
  "#E8A838", // amber
  "#D4845F", // copper
  "#C75577", // rose
  "#8B5CF6", // violet
  "#5B6CF6", // indigo
  "#3B82F6", // blue
  "#14B8A6", // teal
];

interface GlobeNode {
  lat: number;
  lng: number;
  color: string;
  size: number;
  pulse: number;
  connections: number[];
}

function NetworkGlobe({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GlobeNode[]>([]);
  const rotationRef = useRef(0);
  const frameRef = useRef<number>(0);

  // Generate nodes based on progress
  useEffect(() => {
    const nodeCount = Math.floor(progress * 50);
    if (nodesRef.current.length < nodeCount) {
      // Add new nodes
      for (let i = nodesRef.current.length; i < nodeCount; i++) {
        const newNode: GlobeNode = {
          lat: (Math.random() - 0.5) * 160,
          lng: Math.random() * 360,
          color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
          size: 3 + Math.random() * 2,
          pulse: Math.random() * Math.PI * 2,
          connections: [],
        };

        // Connect to 1-3 random existing nodes
        if (nodesRef.current.length > 0) {
          const connectionCount = Math.min(nodesRef.current.length, 1 + Math.floor(Math.random() * 3));
          for (let j = 0; j < connectionCount; j++) {
            const targetIndex = Math.floor(Math.random() * nodesRef.current.length);
            if (!newNode.connections.includes(targetIndex)) {
              newNode.connections.push(targetIndex);
            }
          }
        }

        nodesRef.current.push(newNode);
      }
    }
  }, [progress]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Slow rotation
      rotationRef.current += 0.002;

      // Draw wireframe globe
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const y = centerY + radius * Math.sin((lat * Math.PI) / 180);
        const r = radius * Math.cos((lat * Math.PI) / 180);
        ctx.ellipse(centerX, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let lng = 0; lng < 180; lng += 30) {
        ctx.beginPath();
        const angle = (lng * Math.PI) / 180 + rotationRef.current;
        for (let lat = -90; lat <= 90; lat += 5) {
          const latRad = (lat * Math.PI) / 180;
          const x = centerX + radius * Math.cos(latRad) * Math.sin(angle);
          const y = centerY + radius * Math.sin(latRad);
          if (lat === -90) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Helper function to convert lat/lng to screen coordinates
      const latLngToScreen = (lat: number, lng: number) => {
        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180 + rotationRef.current;
        const x = centerX + radius * Math.cos(latRad) * Math.sin(lngRad);
        const y = centerY + radius * Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(lngRad);
        return { x, y, z, visible: z > -0.2 };
      };

      const nodes = nodesRef.current;
      const time = Date.now() * 0.001;

      // Draw connections first (behind nodes)
      nodes.forEach((node, i) => {
        const pos1 = latLngToScreen(node.lat, node.lng);
        if (!pos1.visible) return;

        node.connections.forEach((targetIndex) => {
          if (targetIndex >= nodes.length) return;
          const targetNode = nodes[targetIndex];
          const pos2 = latLngToScreen(targetNode.lat, targetNode.lng);
          if (!pos2.visible) return;

          // Draw arc connection
          const gradient = ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y);
          gradient.addColorStop(0, node.color + "60");
          gradient.addColorStop(0.5, "rgba(74, 123, 247, 0.4)");
          gradient.addColorStop(1, targetNode.color + "60");

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;

          // Curved line (arc)
          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2 - 20;
          ctx.moveTo(pos1.x, pos1.y);
          ctx.quadraticCurveTo(midX, midY, pos2.x, pos2.y);
          ctx.stroke();

          // Animated pulse along connection
          const pulsePos = (time * 0.5 + i * 0.1) % 1;
          const pulseX = pos1.x + (pos2.x - pos1.x) * pulsePos;
          const pulseY = pos1.y + (pos2.y - pos1.y) * pulsePos - Math.sin(pulsePos * Math.PI) * 20;

          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(74, 123, 247, 0.6)";
          ctx.fill();
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pos = latLngToScreen(node.lat, node.lng);
        if (!pos.visible) return;

        const pulseScale = 1 + 0.2 * Math.sin(time * 2 + node.pulse);
        const size = node.size * pulseScale * (0.5 + pos.z * 0.5);

        // Glow
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 4);
        glow.addColorStop(0, node.color + "40");
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

const statBadges = [
  { bold: "Agent-to-agent", muted: "Your Agencer talks to their Agencer" },
  { bold: "Permission-based", muted: "Nothing moves without human approval" },
  { bold: "Emergent", muted: "The network grows with every user" },
];

export function Network() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="network"
      className="relative min-h-[200vh] bg-[#0a0a0a]"
    >
      <div className="sticky top-0 min-h-screen flex flex-col">
        {/* Globe visualization - 60vh */}
        <div className="relative h-[60vh] w-full">
          <NetworkGlobe progress={scrollProgress} />
        </div>

        {/* Text content */}
        <div className="flex-1 px-6 py-12">
          <div className="max-w-[900px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel>The Network</SectionLabel>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif font-medium text-text-headline mb-12"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              What emerges.
            </motion.h2>

            {/* Body copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <p
                className="font-sans text-text-secondary leading-relaxed mb-6"
                style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}
              >
                Agencer is not just a tool. It is a node. Your node in a growing network. When you use Agencer, your AI can coordinate with other Agencers. Negotiate. Delegate. Trade tasks. Your AI does not just work for you. It works with others on your behalf.
              </p>
            </motion.div>

            {/* Glass panel callout - Sarah example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 p-6 md:p-8 rounded-xl text-left"
              style={{
                background: "rgba(255, 180, 100, 0.03)",
                border: "1px solid rgba(255, 180, 100, 0.1)",
                borderLeft: "2px solid rgba(255, 180, 100, 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="font-sans text-text-secondary leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.2vw, 1.15rem)" }}
              >
                You say: &ldquo;Ask Sarah for the Q3 numbers.&rdquo; Your Agencer talks to Sarah&apos;s Agencer. She gets a notification, approves, and her Agencer pulls the data and sends it back. No Slack thread. No status meeting. No email chain. The AIs coordinate. The humans stay in control.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <p
                className="font-sans text-text-secondary leading-relaxed"
                style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}
              >
                This is not a feature we ship on day one. It is what naturally emerges once the coordination layer exists. And once it exists, it changes everything.
              </p>
            </motion.div>

            {/* Stat badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {statBadges.map((badge, i) => (
                <div
                  key={i}
                  className="p-5 rounded-lg text-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <p className="font-sans font-semibold text-white text-sm mb-1">
                    {badge.bold}
                  </p>
                  <p
                    className="font-sans text-xs"
                    style={{ color: "rgba(255, 255, 255, 0.5)" }}
                  >
                    {badge.muted}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
