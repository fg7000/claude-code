"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Mic, Calendar, Clock, Phone, AlertCircle, PhoneCall, RotateCcw, Brain, GitBranch, Play, Search, CheckCircle, FileText, Send, Image, Share2, BarChart3, Folder } from "lucide-react";

interface FlowNode {
  label: string;
  icon: React.ReactNode;
  split?: boolean;
  splitLabels?: string[];
  reconverge?: boolean;
}

interface TaskFlow {
  id: string;
  color: string;
  colorVar: string;
  command: string;
  nodes: FlowNode[];
  tagline: string;
}

const flows: TaskFlow[] = [
  {
    id: "relentless",
    color: "#E8A838",
    colorVar: "var(--logo-amber)",
    command: "Remind me Monday to pay the invoices. If I haven't done it by 4pm Pacific, text me. If I don't reply within an hour, call me. This has to be done by 10pm. Don't let it go.",
    nodes: [
      { label: "Sets Monday reminder", icon: <Calendar className="w-4 h-4" /> },
      { label: "4pm PT: checks status", icon: <Clock className="w-4 h-4" /> },
      { label: "Sends SMS", icon: <Phone className="w-4 h-4" /> },
      { label: "5pm: no reply detected", icon: <AlertCircle className="w-4 h-4" /> },
      { label: "Places phone call", icon: <PhoneCall className="w-4 h-4" /> },
      { label: "Repeats until confirmed", icon: <RotateCcw className="w-4 h-4" /> },
    ],
    tagline: "Six escalation steps. Three communication channels. Zero things you had to remember.",
  },
  {
    id: "bakeoff",
    color: "#C75577",
    colorVar: "var(--logo-rose)",
    command: "I want an animated button with a colorful sphere that breaks apart into smaller floating orbs on hover. Ask both Claude Code and Gemini to build this, and I want to see who does it better on the first shot.",
    nodes: [
      { label: "Interprets design intent", icon: <Brain className="w-4 h-4" /> },
      { label: "Sends to both AIs", icon: <GitBranch className="w-4 h-4" />, split: true, splitLabels: ["Claude Code", "Gemini"] },
      { label: "Builds in parallel", icon: <Play className="w-4 h-4" />, reconverge: true },
      { label: "Presents both results", icon: <CheckCircle className="w-4 h-4" /> },
    ],
    tagline: "Two AIs. One prompt. Side-by-side results. You pick the winner.",
  },
  {
    id: "research",
    color: "#8B5CF6",
    colorVar: "var(--logo-violet)",
    command: "Compare the cost of running open-source models on Kimi K2 versus Amazon Bedrock. Do the deep research with Opus 4.5. Then have Grok check for contradictions. If there are contradictions, text me. If there are none, build a presentation in Gamma and email it to the board.",
    nodes: [
      { label: "Opus 4.5: deep research", icon: <Search className="w-4 h-4" /> },
      { label: "Pulls pricing data", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Compiles analysis", icon: <FileText className="w-4 h-4" /> },
      { label: "Grok: contradiction check", icon: <CheckCircle className="w-4 h-4" /> },
      { label: "Conditional routing", icon: <GitBranch className="w-4 h-4" />, split: true, splitLabels: ["If issues → texts you", "If clean → continues"] },
      { label: "Builds Gamma deck", icon: <FileText className="w-4 h-4" />, reconverge: true },
      { label: "Emails board", icon: <Send className="w-4 h-4" /> },
    ],
    tagline: "Three models. Autonomous verification. Conditional logic. Board-ready, or you hear about it first.",
  },
  {
    id: "campaign",
    color: "#3B82F6",
    colorVar: "var(--logo-blue)",
    command: "Grab our company logo, use Ideogram to generate a set of ad creatives, then post them across LinkedIn, Twitter, and Instagram over the next 24 hours. After 24 hours, pull the performance data and generate a report on which ones performed best.",
    nodes: [
      { label: "Retrieves company logo", icon: <Folder className="w-4 h-4" /> },
      { label: "Ideogram: generates ads", icon: <Image className="w-4 h-4" /> },
      { label: "Posts to platforms", icon: <Share2 className="w-4 h-4" />, split: true, splitLabels: ["LinkedIn", "Twitter", "Instagram"] },
      { label: "Staggers over 24 hours", icon: <Clock className="w-4 h-4" />, reconverge: true },
      { label: "Pulls analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Delivers report", icon: <FileText className="w-4 h-4" /> },
    ],
    tagline: "One logo in. Seven ad creatives out. Three platforms. Automated performance tracking.",
  },
];

function FlowStream({ flow, index }: { flow: TaskFlow; index: number }) {
  const flowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1); // -1 means not started, 0+ means which node is active
  const hasAnimated = useRef(false);

  // Detect when this flow becomes visible/centered on screen
  useEffect(() => {
    if (!flowRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: "-10% 0px -10% 0px" // Trigger when closer to center
      }
    );

    observer.observe(flowRef.current);
    return () => observer.disconnect();
  }, []);

  // Time-based animation: light up nodes one by one after becoming visible
  useEffect(() => {
    if (!isVisible) return;

    // Start the origin point immediately
    setActiveNodeIndex(0);

    // Then light up each node one by one with 1 second delay
    const totalNodes = flow.nodes.length;
    let currentNode = 0;

    const interval = setInterval(() => {
      currentNode++;
      if (currentNode <= totalNodes) {
        setActiveNodeIndex(currentNode);
      } else {
        clearInterval(interval);
      }
    }, 1000); // 1 second between each node

    return () => clearInterval(interval);
  }, [isVisible, flow.nodes.length]);

  const isStarted = activeNodeIndex >= 0;
  const allComplete = activeNodeIndex > flow.nodes.length;

  return (
    <motion.div
      ref={flowRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-20 last:mb-0"
    >
      {/* Voice command - sans-serif for readability */}
      <div className="mb-10">
        <div
          className="p-6 md:p-8 max-w-3xl rounded-2xl"
          style={{
            background: 'var(--glass-bg)',
            border: `1px solid ${flow.color}30`,
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${flow.color}20`, border: `1px solid ${flow.color}40` }}
            >
              <Mic className="w-5 h-5" style={{ color: flow.color }} />
            </div>
            <p
              className="font-sans font-normal leading-relaxed"
              style={{
                fontSize: 'clamp(1.1rem, 1.3vw, 1.25rem)',
                color: 'rgba(255, 255, 255, 0.85)'
              }}
            >
              &ldquo;{flow.command}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Stream visualization - more spacing between nodes */}
      <div className="relative pl-4 md:pl-12">
        {/* Main stream line */}
        <div className="relative flex items-center gap-6 md:gap-10 pt-20 pb-8 overflow-x-auto scrollbar-hide">
          {/* Origin point */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-500"
            style={{
              backgroundColor: isStarted ? flow.color : `${flow.color}40`,
              boxShadow: isStarted ? `0 0 12px 4px ${flow.color}60` : 'none'
            }}
          />

          {/* Connecting line - thinner, lower opacity */}
          <div
            className="h-px w-10 md:w-16 flex-shrink-0 transition-all duration-500"
            style={{
              background: isStarted ? `${flow.color}50` : `${flow.color}30`,
              opacity: 0.5
            }}
          />

          {/* Nodes */}
          {flow.nodes.map((node, nodeIndex) => {
            const isActive = activeNodeIndex > nodeIndex; // Node is active if we've passed it

            return (
              <div key={nodeIndex} className="flex items-center gap-6 md:gap-10 flex-shrink-0">
                {/* Node */}
                <div
                  className={`relative flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}
                >
                  {/* Split indicator - positioned higher, better z-index */}
                  {node.split && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {node.splitLabels?.map((label, i) => (
                        <span
                          key={i}
                          className="text-xs font-mono whitespace-nowrap px-3 py-1.5 rounded-md shadow-lg"
                          style={{
                            backgroundColor: 'rgba(10, 10, 10, 0.95)',
                            color: isActive ? flow.color : `${flow.color}90`,
                            border: `1px solid ${flow.color}50`,
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Node circle */}
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      backgroundColor: isActive ? `${flow.color}20` : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${isActive ? flow.color : flow.color + '40'}`,
                      boxShadow: isActive ? `0 0 20px 6px ${flow.color}40` : 'none'
                    }}
                  >
                    <span style={{ color: isActive ? flow.color : `${flow.color}60` }}>
                      {node.icon}
                    </span>
                  </div>

                  {/* Node label - better spacing */}
                  <span
                    className="mt-3 text-xs md:text-sm font-mono text-center max-w-[90px] md:max-w-[120px] transition-all duration-500 leading-tight"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {node.label}
                  </span>
                </div>

                {/* Connecting line to next node - thinner, lower opacity */}
                {nodeIndex < flow.nodes.length - 1 && (
                  <div
                    className="h-px w-10 md:w-16 flex-shrink-0 transition-all duration-500"
                    style={{
                      background: isActive ? `${flow.color}50` : `${flow.color}30`,
                      opacity: 0.5
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tagline - more vertical spacing */}
      <p
        className="mt-8 mb-12 pl-4 md:pl-12 font-mono text-sm md:text-base transition-all duration-500"
        style={{ color: allComplete ? flow.color : 'var(--text-secondary)' }}
      >
        {flow.tagline}
      </p>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-bg-primary py-20 md:py-32"
    >
      <div className="min-h-screen">
        {/* Background wave glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, var(--accent-wave-glow) 0%, transparent 50%)`
          }}
        />

        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <SectionLabel>How It Works</SectionLabel>
            <h2
              className="font-serif font-medium text-text-headline mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Five seconds from thought to action.
            </h2>
            <p className="font-sans text-text-secondary max-w-2xl mx-auto" style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}>
              One voice command. Multiple models. Dozens of tools. Here&apos;s what that looks like.
            </p>
          </motion.div>

          {/* Task flows - more vertical spacing between flows */}
          <div className="space-y-16">
            {flows.map((flow, index) => (
              <FlowStream
                key={flow.id}
                flow={flow}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
