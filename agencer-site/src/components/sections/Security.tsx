"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

// Simple line-art SVG icons
const icons = {
  vault: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="24" height="20" rx="2" />
      <circle cx="16" cy="18" r="4" />
      <path d="M16 14v-2" />
      <path d="M12 8V5a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  filter: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h24" />
      <path d="M7 12h18" />
      <path d="M10 18h12" />
      <path d="M13 24h6" />
    </svg>
  ),
  approval: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l4 4 10-10" />
      <path d="M21 16v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h8" />
    </svg>
  ),
  shield: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4l10 4v8c0 6-4.5 10.5-10 12-5.5-1.5-10-6-10-12V8l10-4z" />
      <path d="M11 16l4 4 6-6" />
    </svg>
  ),
  server: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="20" height="8" rx="1" />
      <rect x="6" y="14" width="20" height="8" rx="1" />
      <circle cx="10" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="18" r="1" fill="currentColor" />
      <path d="M16 24v4" />
      <path d="M12 28h8" />
    </svg>
  ),
  brain: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8a4 4 0 0 0-4 4c-2 0-4 2-4 4s2 4 4 4a4 4 0 0 0 4 4h2" />
      <path d="M20 8a4 4 0 0 1 4 4c2 0 4 2 4 4s-2 4-4 4a4 4 0 0 1-4 4h-2" />
      <path d="M16 4v24" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  ),
};

const securityBlocks = [
  {
    icon: icons.vault,
    heading: "Your keys never touch a file.",
    body: "Every credential is stored in an encrypted vault. AES-256 at rest, TLS 1.3 in transit. Per-user isolation. Not in a config file on your laptop. Not in plaintext anyone can read. Encrypted, isolated, inaccessible to our team.",
  },
  {
    icon: icons.filter,
    heading: "Every model gets exactly what it needs. Nothing more.",
    body: "Context boundaries are enforced at the protocol level. When Agencer routes a task to Claude or GPT, it builds a curated context package for that specific request. The model never gets raw access to your data. It gets the minimum it needs, responds, and the package is discarded. No persistent copies. No leaking between tasks, models, or users.",
  },
  {
    icon: icons.approval,
    heading: "Nothing executes without your say.",
    body: "Human-in-the-loop by default. Emails, social posts, financial actions, file operations. Agencer confirms before it acts. Full audit log of every action, every model, every timestamp. You can review everything that happened and when.",
  },
  {
    icon: icons.shield,
    heading: "Untrusted content can't hijack the system.",
    body: "Prompt injection is the attack that broke other agents. Someone sends you an email with hidden instructions and the agent obeys. Agencer separates the context that processes external content from the executor that takes action. External inputs are sandboxed. They can't escalate to system-level commands.",
  },
  {
    icon: icons.server,
    heading: "DeepSeek runs on American servers.",
    body: "When you use open-source models like DeepSeek through Agencer, your data never leaves US infrastructure. Everything routes through Amazon Bedrock. Nothing is transmitted to servers outside your control. You get the capability without the exposure.",
  },
  {
    icon: icons.brain,
    heading: "Your memory is the key.",
    body: "For sensitive actions, Agencer doesn't ask for a password you set three years ago. It asks you something only you would know from your own recent conversations. Your interaction history becomes your authentication layer. An attacker who hijacks your session can't answer. We call this Cognitive Biometric Identification, a proprietary technology that gets stronger the more you use Agencer.",
  },
];

const statBadges = [
  { bold: "AES-256 / TLS 1.3", muted: "Encrypted at rest and in transit" },
  { bold: "Per-user isolation", muted: "Your data never touches another user's context" },
  { bold: "Full audit trail", muted: "Every action, every model, timestamped" },
];

export function Security() {
  return (
    <section
      id="security"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      {/* Geometric grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-5 md:px-6 text-center">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Security</SectionLabel>
        </motion.div>

        {/* Headline - single line on desktop, centered */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif font-medium text-text-headline mb-12 lg:whitespace-nowrap text-center mx-auto"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)" }}
        >
          Built for the world that watched agents fail.
        </motion.h2>

        {/* Six content blocks */}
        <div className="flex flex-col gap-8 mb-16">
          {securityBlocks.map((block, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="p-8 rounded-xl text-center"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {/* Icon */}
              <div
                className="flex justify-center mb-4"
                style={{ color: "var(--accent-wave)", opacity: 0.6 }}
              >
                {block.icon}
              </div>
              <h3
                className="font-sans font-semibold text-white mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                {block.heading}
              </h3>
              <p
                className="font-sans font-normal leading-relaxed"
                style={{ fontSize: "1.05rem", color: "rgba(255, 255, 255, 0.75)" }}
              >
                {block.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Three stat badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {statBadges.map((badge, i) => (
            <div
              key={i}
              className="p-5 rounded-lg text-center"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
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

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="font-mono text-xs"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          GDPR-ready architecture. SOC 2 compliance on roadmap.
        </motion.p>
      </div>
    </section>
  );
}
