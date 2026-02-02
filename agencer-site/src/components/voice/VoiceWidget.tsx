"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send, MicOff } from "lucide-react";

// Agencer brand colors for the blades
const BLADE_COLORS = [
  "#F59E0B", // amber
  "#D97706", // copper
  "#F43F5E", // rose
  "#8B5CF6", // violet
  "#6366F1", // indigo
  "#3B82F6", // blue
  "#14B8A6", // teal
];

// Demo script lines
const DEMO_LINES = [
  "This is Agencer. This is how I talk to you.",
  "I connect to everything. I talk to anything. And I never forget.",
  "Try me. Unmute your mic and say hello.",
];

interface AgencerLogoProps {
  size?: number;
  bladeOpacities: number[];
  ringScale: number;
  ringGlow: number;
}

// Decomposed Agencer Logo with individually addressable blades
function AgencerLogo({ size = 40, bladeOpacities, ringScale, ringGlow }: AgencerLogoProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.15;
  const bladeLength = outerRadius - innerRadius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transition-transform"
      style={{
        transform: `scale(${ringScale})`,
        filter: ringGlow > 0 ? `drop-shadow(0 0 ${ringGlow * 8}px rgba(245, 158, 11, ${ringGlow * 0.3}))` : undefined,
      }}
    >
      {/* Outer ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={outerRadius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={size * 0.04}
      />

      {/* Inner blades - colorful spiral elements */}
      {BLADE_COLORS.map((color, index) => {
        const angle = (index / BLADE_COLORS.length) * Math.PI * 2 - Math.PI / 2;
        const startX = centerX + Math.cos(angle) * innerRadius;
        const startY = centerY + Math.sin(angle) * innerRadius;
        const endX = centerX + Math.cos(angle) * (innerRadius + bladeLength * 0.7);
        const endY = centerY + Math.sin(angle) * (innerRadius + bladeLength * 0.7);

        // Create a blade shape (tapered from center outward)
        const bladeWidth = size * 0.08;
        const perpAngle = angle + Math.PI / 2;
        const perpX = Math.cos(perpAngle) * bladeWidth / 2;
        const perpY = Math.sin(perpAngle) * bladeWidth / 2;

        const opacity = bladeOpacities[index] ?? 0.4;
        const glowAmount = opacity > 0.6 ? (opacity - 0.4) * 15 : 0;

        return (
          <g key={index}>
            <path
              d={`
                M ${startX - perpX * 0.3} ${startY - perpY * 0.3}
                L ${endX - perpX * 0.1} ${endY - perpY * 0.1}
                L ${endX + perpX * 0.1} ${endY + perpY * 0.1}
                L ${startX + perpX * 0.3} ${startY + perpY * 0.3}
                Z
              `}
              fill={color}
              style={{
                opacity,
                filter: glowAmount > 0 ? `drop-shadow(0 0 ${glowAmount}px ${color})` : undefined,
                transition: "opacity 0.1s ease-out",
              }}
            />
          </g>
        );
      })}

      {/* Center dot */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius * 0.6}
        fill="rgba(255, 255, 255, 0.8)"
      />
    </svg>
  );
}

// Speech bubble component
interface SpeechBubbleProps {
  words: string[];
  currentWordIndex: number;
  isVisible: boolean;
  showMicIcon: boolean;
}

function SpeechBubble({ words, currentWordIndex, isVisible, showMicIcon }: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-full mb-4 right-0 md:right-auto md:left-auto"
          style={{ maxWidth: "min(320px, calc(100vw - 48px))" }}
        >
          <div
            className="relative px-5 py-4 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <p className="text-[0.95rem] leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              {words.slice(0, currentWordIndex + 1).map((word, idx) => {
                const isMicWord = showMicIcon && word === "mic";
                return (
                  <span key={idx}>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {word}
                    </motion.span>
                    {isMicWord && (
                      <MicOff
                        className="inline-block mx-1 animate-pulse"
                        size={16}
                        style={{ color: "var(--accent-warm)" }}
                      />
                    )}
                    {idx < currentWordIndex && " "}
                  </span>
                );
              })}
            </p>

            {/* Caret pointing to widget */}
            <div
              className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mic permission toast
function MicToast({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-full mb-24 right-0 whitespace-nowrap"
        >
          <p
            className="text-[0.8rem] font-mono px-3 py-2 rounded-lg"
            style={{
              color: "var(--accent-warm)",
              background: "rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            🎙 Unmute your microphone to talk to Agencer
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function VoiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("");
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  // Animation states
  const [bladeOpacities, setBladeOpacities] = useState<number[]>(
    BLADE_COLORS.map(() => 0.4)
  );
  const [ringScale, setRingScale] = useState(1);
  const [ringGlow, setRingGlow] = useState(0);

  // Demo state
  const [demoActive, setDemoActive] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [demoCompleted, setDemoCompleted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Mic permission state
  const [showMicToast, setShowMicToast] = useState(false);
  const [micPermissionChecked, setMicPermissionChecked] = useState(false);

  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFlashedBlade = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);

  // Flash a random blade (not the same as last time)
  const flashRandomBlade = useCallback(() => {
    let nextBlade: number;
    do {
      nextBlade = Math.floor(Math.random() * BLADE_COLORS.length);
    } while (nextBlade === lastFlashedBlade.current && BLADE_COLORS.length > 1);

    lastFlashedBlade.current = nextBlade;

    // Set the blade to full brightness
    setBladeOpacities(prev => {
      const newOpacities = [...prev];
      newOpacities[nextBlade] = 1;
      return newOpacities;
    });

    // Fade back to base over 300ms using requestAnimationFrame
    const startTime = performance.now();
    const duration = 300;
    const startOpacity = 1;
    const endOpacity = 0.4;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity - (startOpacity - endOpacity) * progress;

      setBladeOpacities(prev => {
        const newOpacities = [...prev];
        // Only update if this blade hasn't been flashed again
        if (newOpacities[nextBlade] !== 1) {
          newOpacities[nextBlade] = currentOpacity;
        }
        return newOpacities;
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Start ambient twinkle (one flash every ~1.5 seconds)
  const startAmbientTwinkle = useCallback(() => {
    if (ambientIntervalRef.current) {
      clearInterval(ambientIntervalRef.current);
    }
    ambientIntervalRef.current = setInterval(() => {
      flashRandomBlade();
    }, 1500);
  }, [flashRandomBlade]);

  // Stop ambient twinkle
  const stopAmbientTwinkle = useCallback(() => {
    if (ambientIntervalRef.current) {
      clearInterval(ambientIntervalRef.current);
      ambientIntervalRef.current = null;
    }
  }, []);

  // Type out a line word by word
  const typeOutLine = useCallback((line: string, lineIndex: number, onComplete: () => void) => {
    const words = line.split(" ");
    setCurrentWords(words);
    setCurrentWordIndex(-1);
    setShowSpeechBubble(true);

    let wordIdx = 0;

    const typeNextWord = () => {
      if (wordIdx >= words.length) {
        onComplete();
        return;
      }

      setCurrentWordIndex(wordIdx);
      flashRandomBlade();

      const word = words[wordIdx];
      let delay = 250 + Math.random() * 100; // 250-350ms base

      // Add pauses after punctuation
      if (word.endsWith(",")) {
        delay = 600;
      } else if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) {
        delay = 900;
      }

      wordIdx++;
      demoTimeoutRef.current = setTimeout(typeNextWord, delay);
    };

    // Start typing after a brief moment
    demoTimeoutRef.current = setTimeout(typeNextWord, 300);
  }, [flashRandomBlade]);

  // Run the demo sequence
  const runDemo = useCallback(() => {
    if (userInteracted || isOpen) return;

    setDemoActive(true);
    stopAmbientTwinkle();

    const playLine = (lineIndex: number) => {
      if (userInteracted || isOpen) {
        setDemoActive(false);
        return;
      }

      if (lineIndex >= DEMO_LINES.length) {
        // Demo completed - start ambient twinkle and show mic toast if needed
        setDemoCompleted(true);
        startAmbientTwinkle();

        // Check mic permission and show toast if needed
        if (!micPermissionChecked) {
          checkMicPermission();
        }

        // Loop after 10 seconds
        demoTimeoutRef.current = setTimeout(() => {
          if (!userInteracted && !isOpen) {
            setShowSpeechBubble(false);
            setDemoCompleted(false);
            demoTimeoutRef.current = setTimeout(() => {
              runDemo();
            }, 500);
          }
        }, 10000);

        return;
      }

      setCurrentLineIndex(lineIndex);

      typeOutLine(DEMO_LINES[lineIndex], lineIndex, () => {
        // Pause after line completes
        demoTimeoutRef.current = setTimeout(() => {
          if (lineIndex < DEMO_LINES.length - 1) {
            // Clear bubble and move to next line
            setShowSpeechBubble(false);
            demoTimeoutRef.current = setTimeout(() => {
              playLine(lineIndex + 1);
            }, 300);
          } else {
            // Last line - keep visible
            playLine(lineIndex + 1);
          }
        }, 1500);
      });
    };

    playLine(0);
  }, [userInteracted, isOpen, typeOutLine, stopAmbientTwinkle, startAmbientTwinkle, micPermissionChecked]);

  // Check microphone permission
  const checkMicPermission = useCallback(async () => {
    setMicPermissionChecked(true);

    try {
      // Check if permission is already granted
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });

      if (permissionStatus.state === "denied" || permissionStatus.state === "prompt") {
        setShowMicToast(true);
        // Hide toast after 8 seconds
        setTimeout(() => {
          setShowMicToast(false);
        }, 8000);
      }

      // Listen for permission changes
      permissionStatus.onchange = () => {
        if (permissionStatus.state === "granted") {
          setShowMicToast(false);
        }
      };
    } catch {
      // Fallback: try to get user media to check permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setShowMicToast(false);
      } catch {
        setShowMicToast(true);
        setTimeout(() => {
          setShowMicToast(false);
        }, 8000);
      }
    }
  }, []);

  // Start demo after delay or on scroll
  useEffect(() => {
    if (isOpen || userInteracted) return;

    // Start demo after 4 seconds
    const initialTimeout = setTimeout(() => {
      if (!isOpen && !userInteracted) {
        runDemo();
      }
    }, 4000);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [isOpen, userInteracted, runDemo]);

  // Handle user interaction
  const handleUserInteraction = useCallback(() => {
    setUserInteracted(true);
    setDemoActive(false);
    stopAmbientTwinkle();

    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
    }

    setShowSpeechBubble(false);
    setShowMicToast(false);
  }, [stopAmbientTwinkle]);

  // Open widget event listener
  useEffect(() => {
    const handleOpenWidget = () => {
      handleUserInteraction();
      setIsOpen(true);
    };
    window.addEventListener("openVoiceWidget", handleOpenWidget);

    return () => {
      window.removeEventListener("openVoiceWidget", handleOpenWidget);
    };
  }, [handleUserInteraction]);

  // Scroll visibility handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;

      if (velocity > 50 && !isOpen) {
        setIsVisible(false);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
      }
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  const handleWidgetClick = () => {
    handleUserInteraction();
    setIsOpen(true);
  };

  return (
    <>
      {/* Collapsed Widget Button with Speech Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
          >
            {/* Mic Toast */}
            <MicToast isVisible={showMicToast && demoCompleted} />

            {/* Speech Bubble */}
            <SpeechBubble
              words={currentWords}
              currentWordIndex={currentWordIndex}
              isVisible={showSpeechBubble}
              showMicIcon={currentLineIndex === 2}
            />

            <button
              onClick={handleWidgetClick}
              className="group relative"
              aria-label="Open voice assistant"
            >
              {/* Inner button with animated logo */}
              <div className="relative w-14 h-14 md:w-14 md:h-14 rounded-full bg-bg-primary border border-glass-border flex items-center justify-center">
                <AgencerLogo
                  size={40}
                  bladeOpacities={bladeOpacities}
                  ringScale={ringScale}
                  ringGlow={ringGlow}
                />
              </div>

              {/* Hover label */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-bg-tertiary text-sm text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                Talk to me instead
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed z-50 glass-panel overflow-hidden
                inset-4 md:inset-auto md:bottom-8 md:right-8 md:w-[360px] md:h-[500px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <AgencerLogo
                    size={28}
                    bladeOpacities={BLADE_COLORS.map(() => 0.6)}
                    ringScale={1}
                    ringGlow={0}
                  />
                  <span className="font-serif text-lg text-text-headline">Agencer</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Close voice assistant"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Conversation Area */}
              <div className="flex-1 p-4 overflow-y-auto h-[calc(100%-140px)] md:h-[calc(500px-140px)]">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <AgencerLogo
                      size={32}
                      bladeOpacities={BLADE_COLORS.map(() => 0.5)}
                      ringScale={1}
                      ringGlow={0}
                    />
                  </div>
                  <div className="glass-panel p-3 rounded-2xl rounded-tl-sm">
                    <p className="text-text-primary text-sm">
                      Hi. I&apos;m Agencer. What can I help you with?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-glass-border">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-bg-tertiary border border-glass-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-wave/50 transition-colors"
                  />
                  <button
                    type="button"
                    className="p-2.5 rounded-full bg-bg-tertiary border border-glass-border hover:border-accent-wave/50 transition-colors"
                    aria-label="Voice input"
                  >
                    <Mic className="w-5 h-5 text-text-secondary" />
                  </button>
                  <button
                    type="submit"
                    className="p-2.5 rounded-full bg-accent-warm hover:bg-accent-warm-hover transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5 text-bg-primary" />
                  </button>
                </form>
                <p className="text-xs text-text-secondary/60 text-center mt-2">
                  Voice and text both work.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
