"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const openVoiceWidget = () => {
    const event = new CustomEvent("openVoiceWidget");
    window.dispatchEvent(event);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-panel !rounded-none border-t-0 border-x-0"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <Image
              src="/agencer-logo.png"
              alt="Agencer"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-serif text-xl text-text-headline tracking-wide">
              agencer
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollToSection("pricing")}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-headline transition-colors"
            >
              Pricing
            </button>
            <span className="text-text-secondary/30">•</span>
            <button
              onClick={openVoiceWidget}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-headline transition-colors"
            >
              Talk to Agencer
            </button>
            <span className="text-text-secondary/30">•</span>
            <Button variant="outline" size="sm" href="#">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-text-secondary hover:text-text-headline transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] glass-panel !rounded-none"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-12">
                <a href="#" className="flex items-center gap-3">
                  <Image
                    src="/agencer-logo.png"
                    alt="Agencer"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <span className="font-serif text-xl text-text-headline tracking-wide">
                    agencer
                  </span>
                </a>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-text-secondary hover:text-text-headline transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-2xl font-serif text-text-headline hover:text-accent-warm transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={openVoiceWidget}
                  className="text-left text-2xl font-serif text-text-headline hover:text-accent-warm transition-colors"
                >
                  Talk to Agencer
                </button>
              </div>

              <div className="mt-auto">
                <Button variant="solid" size="lg" href="#" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
