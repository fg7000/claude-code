"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send, MicOff } from "lucide-react";

// Demo script lines
const DEMO_LINES = [
  "This is Agencer. This is how I talk to you.",
  "I connect to everything. I talk to anything. And I never forget.",
  "Try me. Unmute your mic and say hello.",
];

// Petal colors matching the logo spiral (12 petals going clockwise from top)
const PETAL_COLORS = [
  "#1e3a5f", // dark blue (top)
  "#2563eb", // blue
  "#0891b2", // cyan/teal
  "#059669", // green
  "#65a30d", // lime
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#a855f7", // purple
  "#7c3aed", // violet
  "#4f46e5", // indigo
];

interface AgencerLogoProps {
  size?: number;
  petalGlows: number[]; // Array of 12 glow intensities (0-1)
  pulseIntensity?: number;
}

// Agencer Logo with individually addressable petal overlays
function AgencerLogo({
  size = 40,
  petalGlows,
  pulseIntensity = 0,
}: AgencerLogoProps) {
  const ringSize = size + 12;
  const ringRadius = ringSize / 2;
  const centerOffset = 6; // Offset to center logo within ring

  return (
    <div className="relative" style={{ width: ringSize, height: ringSize }}>
      {/* Outer ring - animates when user speaks */}
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <circle
          cx={ringRadius}
          cy={ringRadius}
          r={ringRadius - 2}
          fill="none"
          stroke={`rgba(255, 255, 255, ${0.1 + pulseIntensity * 0.25})`}
          strokeWidth={1.5}
          style={{
            filter: pulseIntensity > 0.1
              ? `drop-shadow(0 0 ${pulseIntensity * 15}px rgba(212, 168, 83, ${pulseIntensity * 0.6}))`
              : undefined,
            transition: "stroke 0.1s ease-out",
          }}
        />
      </svg>

      {/* Base logo image */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: centerOffset,
          left: centerOffset,
          width: size,
          height: size,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/agencer-logo.png"
          alt="Agencer"
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Petal glow overlays - positioned to match each petal segment */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: centerOffset,
          left: centerOffset,
          width: size,
          height: size,
        }}
      >
        {PETAL_COLORS.map((color, index) => {
          const glowIntensity = petalGlows[index] || 0;
          if (glowIntensity < 0.1) return null;

          // Each petal occupies 30 degrees (360/12), starting from top (-90deg)
          const startAngle = -90 + index * 30;
          const endAngle = startAngle + 30;

          // Create a pie slice using conic-gradient
          const gradientAngle = `from ${startAngle}deg`;

          return (
            <div
              key={index}
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${gradientAngle}, ${color} 0deg, ${color} 30deg, transparent 30deg)`,
                opacity: glowIntensity * 0.7,
                filter: `blur(${glowIntensity * 3}px) drop-shadow(0 0 ${glowIntensity * 15}px ${color})`,
                mixBlendMode: "screen",
                transition: "opacity 0.1s ease-out",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Text display component (no bubble styling)
interface TextDisplayProps {
  words: string[];
  currentWordIndex: number;
  showMicIcon: boolean;
}

function TextDisplay({ words, currentWordIndex, showMicIcon }: TextDisplayProps) {
  if (currentWordIndex < 0) return null;

  return (
    <p
      className="text-center leading-relaxed px-4"
      style={{
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "1rem",
        maxWidth: "90%",
        margin: "0 auto",
      }}
    >
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
  );
}

// Collapsed widget speech bubble
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
          className="absolute bottom-full mb-4"
          style={{
            right: 0,
            width: "280px",
            maxWidth: "calc(100vw - 80px)",
          }}
        >
          <div
            className="relative px-4 py-3 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <p className="text-[0.9rem] leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
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
                        size={14}
                        style={{ color: "var(--accent-warm)" }}
                      />
                    )}
                    {idx < currentWordIndex && " "}
                  </span>
                );
              })}
            </p>
            <div
              className="absolute -bottom-2 right-5 w-3 h-3 rotate-45"
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

// Mic permission prompt
function MicPrompt({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center font-mono text-[0.8rem] mt-4"
          style={{ color: "var(--accent-warm)" }}
        >
          🎙 Unmute your microphone to talk to Agencer
        </motion.p>
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

  // Animation states - individual petal glows (12 petals)
  const [petalGlows, setPetalGlows] = useState<number[]>(new Array(12).fill(0));
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const lastFlashedPetal = useRef<number>(-1);

  // Demo state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [demoCompleted, setDemoCompleted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Panel demo state
  const [panelDemoStarted, setPanelDemoStarted] = useState(false);
  const [panelWords, setPanelWords] = useState<string[]>([]);
  const [panelWordIndex, setPanelWordIndex] = useState(-1);
  const [panelLineIndex, setPanelLineIndex] = useState(0);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panelDemoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Flash random petals (2-4 petals at once for speaking effect)
  const flashPetals = useCallback(() => {
    // Pick 2-4 random petals that aren't the same as last time
    const numPetals = 2 + Math.floor(Math.random() * 3); // 2-4 petals
    const petalsToFlash: number[] = [];

    while (petalsToFlash.length < numPetals) {
      const petal = Math.floor(Math.random() * 12);
      if (!petalsToFlash.includes(petal) && petal !== lastFlashedPetal.current) {
        petalsToFlash.push(petal);
      }
    }

    lastFlashedPetal.current = petalsToFlash[0];

    // Set the petals to full glow
    setPetalGlows(prev => {
      const newGlows = [...prev];
      petalsToFlash.forEach(p => { newGlows[p] = 1; });
      return newGlows;
    });

    // Fade back over 300ms
    setTimeout(() => {
      setPetalGlows(prev => {
        const newGlows = [...prev];
        petalsToFlash.forEach(p => { newGlows[p] = 0.5; });
        return newGlows;
      });
    }, 100);

    setTimeout(() => {
      setPetalGlows(prev => {
        const newGlows = [...prev];
        petalsToFlash.forEach(p => { newGlows[p] = 0; });
        return newGlows;
      });
    }, 300);
  }, []);

  // Start ambient twinkle (random single petal periodically)
  const startAmbientTwinkle = useCallback(() => {
    if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
    ambientIntervalRef.current = setInterval(() => {
      const petal = Math.floor(Math.random() * 12);
      setPetalGlows(prev => {
        const newGlows = [...prev];
        newGlows[petal] = 0.6;
        return newGlows;
      });
      setTimeout(() => {
        setPetalGlows(prev => {
          const newGlows = [...prev];
          newGlows[petal] = 0;
          return newGlows;
        });
      }, 400);
    }, 2000);
  }, []);

  const stopAmbientTwinkle = useCallback(() => {
    if (ambientIntervalRef.current) {
      clearInterval(ambientIntervalRef.current);
      ambientIntervalRef.current = null;
    }
  }, []);

  // Type out a line word by word (for collapsed widget)
  const typeOutLine = useCallback((line: string, lineIdx: number, onComplete: () => void) => {
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
      flashPetals();

      const word = words[wordIdx];
      let delay = 250 + Math.random() * 100;

      if (word.endsWith(",")) delay = 600;
      else if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) delay = 900;

      wordIdx++;
      demoTimeoutRef.current = setTimeout(typeNextWord, delay);
    };

    demoTimeoutRef.current = setTimeout(typeNextWord, 300);
  }, [flashPetals]);

  // Run demo for collapsed widget
  const runDemo = useCallback(() => {
    if (userInteracted || isOpen) return;

    stopAmbientTwinkle();

    const playLine = (lineIndex: number) => {
      if (userInteracted || isOpen) return;

      if (lineIndex >= DEMO_LINES.length) {
        setDemoCompleted(true);
        startAmbientTwinkle();

        demoTimeoutRef.current = setTimeout(() => {
          if (!userInteracted && !isOpen) {
            setShowSpeechBubble(false);
            setDemoCompleted(false);
            demoTimeoutRef.current = setTimeout(runDemo, 500);
          }
        }, 10000);
        return;
      }

      setCurrentLineIndex(lineIndex);
      typeOutLine(DEMO_LINES[lineIndex], lineIndex, () => {
        demoTimeoutRef.current = setTimeout(() => {
          if (lineIndex < DEMO_LINES.length - 1) {
            setShowSpeechBubble(false);
            demoTimeoutRef.current = setTimeout(() => playLine(lineIndex + 1), 300);
          } else {
            playLine(lineIndex + 1);
          }
        }, 1500);
      });
    };

    playLine(0);
  }, [userInteracted, isOpen, typeOutLine, stopAmbientTwinkle, startAmbientTwinkle]);

  // Type out line for panel demo
  const typeOutPanelLine = useCallback((line: string, lineIdx: number, onComplete: () => void) => {
    const words = line.split(" ");
    setPanelWords(words);
    setPanelWordIndex(-1);

    let wordIdx = 0;

    const typeNextWord = () => {
      if (wordIdx >= words.length) {
        onComplete();
        return;
      }

      setPanelWordIndex(wordIdx);
      flashPetals();

      const word = words[wordIdx];
      let delay = 250 + Math.random() * 100;

      if (word.endsWith(",")) delay = 600;
      else if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) delay = 900;

      wordIdx++;
      panelDemoTimeoutRef.current = setTimeout(typeNextWord, delay);
    };

    panelDemoTimeoutRef.current = setTimeout(typeNextWord, 300);
  }, [flashPetals]);

  // Run demo in expanded panel
  const runPanelDemo = useCallback(() => {
    if (panelDemoStarted) return;
    setPanelDemoStarted(true);

    const playLine = (lineIndex: number) => {
      if (!isOpen) return;

      if (lineIndex >= DEMO_LINES.length) {
        startAmbientTwinkle();
        checkMicPermission();
        return;
      }

      setPanelLineIndex(lineIndex);
      typeOutPanelLine(DEMO_LINES[lineIndex], lineIndex, () => {
        panelDemoTimeoutRef.current = setTimeout(() => {
          if (lineIndex < DEMO_LINES.length - 1) {
            setPanelWords([]);
            setPanelWordIndex(-1);
            panelDemoTimeoutRef.current = setTimeout(() => playLine(lineIndex + 1), 300);
          } else {
            playLine(lineIndex + 1);
          }
        }, 1500);
      });
    };

    panelDemoTimeoutRef.current = setTimeout(() => playLine(0), 500);
  }, [isOpen, panelDemoStarted, typeOutPanelLine, startAmbientTwinkle]);

  // Check mic permission
  const checkMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicGranted(true);
      setShowMicPrompt(false);
      setIsListening(true);
    } catch {
      setShowMicPrompt(true);
      setTimeout(() => setShowMicPrompt(false), 8000);
    }
  }, []);

  // Ring breathing when listening
  useEffect(() => {
    if (!isListening) {
      setPulseIntensity(0);
      return;
    }

    let frame = 0;
    const animate = () => {
      frame += 0.08;
      const val = (Math.sin(frame) * 0.5 + 0.5) * 0.7;
      setPulseIntensity(val);
    };
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [isListening]);

  // Start demo for collapsed widget after delay
  useEffect(() => {
    if (isOpen || userInteracted) return;

    const initialTimeout = setTimeout(() => {
      if (!isOpen && !userInteracted) runDemo();
    }, 4000);

    return () => clearTimeout(initialTimeout);
  }, [isOpen, userInteracted, runDemo]);

  // Start panel demo when opened
  useEffect(() => {
    if (isOpen && !panelDemoStarted) {
      runPanelDemo();
    }
  }, [isOpen, panelDemoStarted, runPanelDemo]);

  // Handle user interaction
  const handleUserInteraction = useCallback(() => {
    setUserInteracted(true);
    stopAmbientTwinkle();
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    setShowSpeechBubble(false);
  }, [stopAmbientTwinkle]);

  // Open widget event listener
  useEffect(() => {
    const handleOpenWidget = () => {
      handleUserInteraction();
      setIsOpen(true);
    };
    window.addEventListener("openVoiceWidget", handleOpenWidget);
    return () => window.removeEventListener("openVoiceWidget", handleOpenWidget);
  }, [handleUserInteraction]);

  // Scroll visibility handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;

      if (velocity > 50 && !isOpen) {
        setIsVisible(false);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsVisible(true), 500);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isOpen]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
      if (panelDemoTimeoutRef.current) clearTimeout(panelDemoTimeoutRef.current);
      if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) setMessage("");
  };

  const handleWidgetClick = () => {
    handleUserInteraction();
    setIsOpen(true);
  };

  return (
    <>
      {/* Collapsed Widget */}
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
              <div className="relative flex items-center justify-center rounded-full bg-bg-primary/80 border border-glass-border p-2">
                <AgencerLogo
                  size={36}
                  petalGlows={petalGlows}
                  pulseIntensity={pulseIntensity}
                />
              </div>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-bg-tertiary text-sm text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                Talk to me
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Voice Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
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
              className="fixed z-50 overflow-hidden flex flex-col
                inset-4 md:inset-auto md:bottom-8 md:right-8 md:w-[380px] md:h-[520px]"
              style={{
                background: "rgba(15, 15, 15, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "16px",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>

              {/* Logo area - top */}
              <div className="flex-shrink-0 pt-12 pb-8 flex items-center justify-center">
                <AgencerLogo
                  size={100}
                  petalGlows={petalGlows}
                  pulseIntensity={pulseIntensity}
                />
              </div>

              {/* Text area - middle */}
              <div className="flex-1 flex flex-col items-center justify-start px-6 overflow-y-auto">
                <TextDisplay
                  words={panelWords}
                  currentWordIndex={panelWordIndex}
                  showMicIcon={panelLineIndex === 2}
                />
                <MicPrompt isVisible={showMicPrompt} />

                {isListening && !showMicPrompt && panelWordIndex < 0 && (
                  <p className="text-center text-white/40 text-sm mt-4">
                    Listening...
                  </p>
                )}
              </div>

              {/* Input area - bottom */}
              <div className="flex-shrink-0 p-4 border-t border-white/5">
                <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!micGranted) checkMicPermission();
                      else setIsListening(!isListening);
                    }}
                    className={`p-3 rounded-full transition-all ${
                      isListening
                        ? "bg-accent-warm text-bg-primary animate-pulse"
                        : "bg-white/10 text-white/60 hover:bg-white/15"
                    }`}
                    aria-label="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    className="p-3 rounded-full bg-accent-warm hover:opacity-90 transition-opacity"
                    aria-label="Send"
                  >
                    <Send className="w-5 h-5 text-bg-primary" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
