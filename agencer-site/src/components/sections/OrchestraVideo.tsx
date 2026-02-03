"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { AgencerLogo } from "@/components/ui/AgencerLogo";

export function OrchestraVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section
      id="orchestra-video"
      className="relative min-h-screen flex flex-col items-center justify-center bg-black py-24 px-6"
    >
      {/* Gradient fade from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg-primary to-black" />

      <div className="max-w-[1100px] w-full mx-auto">
        <div className="text-center mb-8">
          <SectionLabel>The Manifesto</SectionLabel>
        </div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative aspect-video w-full rounded-lg overflow-hidden border border-accent-gold/30"
        >
          {/* Video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            preload="none"
            controls={isPlaying}
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/video/manifesto.mp4" type="video/mp4" />
          </video>

          {/* Poster/Play button overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center">
                <AgencerLogo size={80} className="mb-6" />
                <button
                  onClick={handlePlay}
                  className="group relative w-20 h-20 rounded-full bg-accent-gold/10 border border-accent-gold/50 flex items-center justify-center transition-all duration-300 hover:bg-accent-gold/20 hover:scale-105"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 text-accent-gold ml-1" />
                  <div className="absolute inset-0 rounded-full border border-accent-gold/30 animate-ping opacity-50" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Pull quote and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p
            className="font-serif italic text-text-headline max-w-2xl mx-auto mb-8"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            &ldquo;We asked, &apos;Who is best?&apos; The future asks, &apos;What plays best together?&apos;&rdquo;
          </p>

          <p className="text-text-secondary mb-6">Join the orchestra.</p>

          <Button variant="solid" size="lg" href="#">
            Get Started Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
