"use client";

import { useState, useEffect, useRef } from "react";
import { ParticleLogo } from "@/components/animations/ParticleLogo";

export default function ParticleDemo() {
  const [isActive, setIsActive] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [useMic, setUseMic] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  // Simulated audio data for demo
  useEffect(() => {
    if (!isActive || useMic) return;

    const generateFakeAudio = () => {
      const data = new Uint8Array(128);
      const time = Date.now() * 0.001;

      for (let i = 0; i < data.length; i++) {
        // Create a dynamic audio-like pattern
        const bass = i < 10 ? Math.sin(time * 4) * 0.5 + 0.5 : 0;
        const mid = i >= 10 && i < 50 ? Math.sin(time * 6 + i * 0.1) * 0.4 + 0.4 : 0;
        const high = i >= 50 ? Math.sin(time * 10 + i * 0.05) * 0.3 + 0.2 : 0;

        data[i] = Math.floor((bass + mid + high) * 255 * (Math.random() * 0.3 + 0.7));
      }

      setAudioData(data);
      animationRef.current = requestAnimationFrame(generateFakeAudio);
    };

    generateFakeAudio();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, useMic]);

  // Real microphone audio
  const startMicAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudio = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
        }
        if (useMic && isActive) {
          animationRef.current = requestAnimationFrame(updateAudio);
        }
      };

      updateAudio();
      setUseMic(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Using simulated audio instead.");
    }
  };

  const stopMicAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setUseMic(false);
    cancelAnimationFrame(animationRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update mic audio when active changes
  useEffect(() => {
    if (useMic && isActive && analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudio = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
        }
        if (useMic && isActive) {
          animationRef.current = requestAnimationFrame(updateAudio);
        }
      };

      updateAudio();
    }
  }, [useMic, isActive]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-serif text-text-headline mb-8">
        Particle Logo Demo
      </h1>

      <div className="relative mb-8">
        {/* Glow behind particle logo */}
        {isActive && (
          <div
            className="absolute inset-0 logo-glow"
            style={{ transform: "scale(1.5)" }}
          />
        )}
        <ParticleLogo
          size={200}
          particleCount={1000}
          isActive={isActive}
          audioData={audioData}
          className="relative z-10"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-4 rounded-full text-lg font-medium transition-all ${
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-accent-wave hover:bg-accent-wave/80 text-white"
          }`}
        >
          {isActive ? "Stop Talking" : "Start Talking"}
        </button>

        <div className="flex gap-4 mt-4">
          <button
            onClick={useMic ? stopMicAudio : startMicAudio}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              useMic
                ? "bg-green-500 text-white"
                : "bg-bg-tertiary text-text-secondary hover:text-text-headline"
            }`}
          >
            {useMic ? "🎤 Mic Active" : "Use Microphone"}
          </button>
        </div>

        <p className="text-text-secondary text-sm mt-4 text-center max-w-md">
          Click &quot;Start Talking&quot; to see the logo break into particles.
          <br />
          Enable microphone for real audio reactivity!
        </p>
      </div>

      {/* Audio visualization */}
      {isActive && audioData && (
        <div className="mt-8 flex items-end gap-0.5 h-16">
          {Array.from(audioData.slice(0, 64)).map((value, i) => (
            <div
              key={i}
              className="w-1 bg-accent-wave rounded-full transition-all duration-75"
              style={{ height: `${(value / 255) * 64}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
