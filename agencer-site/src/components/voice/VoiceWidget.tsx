"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send } from "lucide-react";
import { AgencerLogo } from "@/components/ui/AgencerLogo";

export function VoiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("");
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleOpenWidget = () => setIsOpen(true);
    window.addEventListener("openVoiceWidget", handleOpenWidget);

    return () => {
      window.removeEventListener("openVoiceWidget", handleOpenWidget);
    };
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <>
      {/* Collapsed Widget Button */}
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
            <button
              onClick={() => setIsOpen(true)}
              className="group relative"
              aria-label="Open voice assistant"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-full gradient-border pulse-subtle" />

              {/* Inner button */}
              <div className="relative w-14 h-14 md:w-14 md:h-14 rounded-full bg-bg-primary flex items-center justify-center m-[3px]">
                <Mic className="w-6 h-6 text-text-headline" />
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
                  <AgencerLogo size={28} />
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
                    <AgencerLogo size={32} animate={false} />
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
                    className="flex-1 bg-bg-tertiary border border-glass-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    className="p-2.5 rounded-full bg-bg-tertiary border border-glass-border hover:border-accent-gold/50 transition-colors"
                    aria-label="Voice input"
                  >
                    <Mic className="w-5 h-5 text-text-secondary" />
                  </button>
                  <button
                    type="submit"
                    className="p-2.5 rounded-full bg-accent-gold hover:bg-accent-gold-hover transition-colors"
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
