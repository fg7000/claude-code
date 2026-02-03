"use client";

import { motion } from "framer-motion";
import { LogoMarquee } from "@/components/animations/LogoMarquee";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";

const rows = [
  {
    items: ["Claude", "GPT-4o", "Gemini", "Grok", "DeepSeek", "Llama", "Mistral", "Qwen", "Cohere", "Claude", "GPT-4o", "Gemini", "Grok", "DeepSeek"],
    direction: "left" as const,
    speed: "normal" as const,
  },
  {
    items: ["Gmail", "Google Docs", "Slack", "Notion", "Linear", "Asana", "Trello", "Jira", "Gmail", "Google Docs", "Slack", "Notion", "Linear"],
    direction: "right" as const,
    speed: "slow" as const,
  },
  {
    items: ["Suno", "ElevenLabs", "Runway", "Midjourney", "DALL-E", "Figma", "Canva", "Suno", "ElevenLabs", "Runway", "Midjourney", "DALL-E", "Figma", "Canva"],
    direction: "left" as const,
    speed: "slow" as const,
  },
  {
    items: ["GitHub", "Replit", "Claude Code", "Vercel", "AWS", "Docker", "VS Code", "GitHub", "Replit", "Claude Code", "Vercel", "AWS", "Docker"],
    direction: "right" as const,
    speed: "normal" as const,
  },
  {
    items: ["LinkedIn", "X/Twitter", "Instagram", "TikTok", "YouTube", "Reddit", "Bluesky", "Threads", "LinkedIn", "X/Twitter", "Instagram", "TikTok"],
    direction: "left" as const,
    speed: "normal" as const,
  },
  {
    items: ["Shopify", "Stripe", "HubSpot", "Salesforce", "QuickBooks", "Airtable", "Shopify", "Stripe", "HubSpot", "Salesforce", "QuickBooks", "Airtable"],
    direction: "right" as const,
    speed: "slow" as const,
  },
];

export function ConnectsToAnything() {
  return (
    <section
      id="connects-to-anything"
      className="relative py-16 min-h-screen overflow-hidden bg-bg-primary"
    >
      {/* Marquee rows - full width */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-60 w-screen left-1/2 -translate-x-1/2">
        {rows.map((row, i) => (
          <LogoMarquee
            key={i}
            items={row.items}
            direction={row.direction}
            speed={row.speed}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(10, 10, 10, 0.95) 70%)",
        }}
      />

      {/* Content overlay - centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassPanel className="max-w-2xl p-8 md:p-12 text-center">
              <SectionLabel className="mb-6">Infinite Connections</SectionLabel>
              <h2
                className="font-serif font-medium text-text-headline mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                If it exists, Agencer connects to it.
              </h2>
              <p className="font-sans text-text-secondary leading-relaxed mb-6" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)" }}>
                APIs. MCP servers. Browser automation. Whatever the interface, Agencer finds it, reads the documentation, and connects, without you configuring anything.
              </p>
              <p className="font-mono text-sm text-accent-warm">
                New MCP server published? Agencer can discover and integrate it the same day.
              </p>
            </GlassPanel>
          </motion.div>
      </div>
    </section>
  );
}
