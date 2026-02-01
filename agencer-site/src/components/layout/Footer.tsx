"use client";

import { Github, Linkedin, Twitter } from "lucide-react";
import { AgencerLogo } from "@/components/ui/AgencerLogo";

export function Footer() {
  return (
    <footer className="bg-bg-primary border-t border-glass-border">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        {/* Logo and Copyright */}
        <div className="flex items-center gap-3">
          <AgencerLogo size={24} />
          <span className="text-sm text-text-secondary">
            © 2026 Agencer, Inc.
          </span>
        </div>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-text-secondary hover:text-text-headline transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-text-secondary hover:text-text-headline transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-sm text-text-secondary hover:text-text-headline transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-text-secondary hover:text-text-headline transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href="#"
            className="text-text-secondary hover:text-text-headline transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="#"
            className="text-text-secondary hover:text-text-headline transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
