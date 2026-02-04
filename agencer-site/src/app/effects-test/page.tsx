"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ParticleLogoEffect, EffectType } from "@/components/animations/ParticleLogoEffect";

const EFFECTS: { type: EffectType; label: string }[] = [
  { type: "breathe", label: "1: Breathe" },
  { type: "shimmer", label: "2: Shimmer" },
  { type: "turbulence", label: "3: Turbulence" },
  { type: "ripple", label: "4: Ripple" },
  { type: "glow", label: "5: Glow" },
];

export default function EffectsTestPage() {
  const [audioMode, setAudioMode] = useState<"off" | "synthetic" | "mic">("off");
  const [amplitude, setAmplitude] = useState(0);
  const [frequencies, setFrequencies] = useState<Float32Array | null>(null);
  const [isOnset, setIsOnset] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const prevAmplitudeRef = useRef(0);
  const onsetThreshold = 0.15;

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }
    return { ctx: audioContextRef.current, analyser: analyserRef.current! };
  }, []);

  // Start synthetic speech simulation
  const startSyntheticSpeech = useCallback(() => {
    const { ctx, analyser } = initAudio();

    // Create oscillator for voice-like sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);

    // Add some frequency variation
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    // Don't connect to destination - silent analysis only

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // Speech pattern: bursts with gaps
    const speechPattern = () => {
      if (!gainNodeRef.current || !audioContextRef.current) return;

      const g = gainNodeRef.current;
      const now = audioContextRef.current.currentTime;

      // Random speech-like pattern
      const patterns = [
        [0.7, 300], [0, 150], [0.5, 200], [0, 100], [0.8, 400], [0, 200],
        [0.6, 250], [0, 120], [0.4, 180], [0, 80], [0.9, 350], [0, 250],
      ];

      let time = now;
      for (const [vol, dur] of patterns) {
        g.gain.setValueAtTime(vol as number, time);
        time += (dur as number) / 1000;
      }

      // Also vary frequency for more realistic sound
      if (oscillatorRef.current) {
        const o = oscillatorRef.current;
        time = now;
        for (let i = 0; i < patterns.length; i++) {
          const freq = 150 + Math.random() * 100;
          o.frequency.setValueAtTime(freq, time);
          time += (patterns[i][1] as number) / 1000;
        }
      }
    };

    speechPattern();
    speechIntervalRef.current = setInterval(speechPattern, 2000);

    setAudioMode("synthetic");
  }, [initAudio]);

  // Start microphone input
  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { ctx, analyser } = initAudio();

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      streamRef.current = stream;
      setAudioMode("mic");
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Could not access microphone");
    }
  }, [initAudio]);

  // Stop all audio
  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
    setAudioMode("off");
    setAmplitude(0);
  }, []);

  // Audio analysis loop
  useEffect(() => {
    if (audioMode === "off" || !analyserRef.current) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Float32Array(bufferLength);

    const analyze = () => {
      analyser.getByteTimeDomainData(timeData);
      analyser.getFloatFrequencyData(freqData);

      // Calculate RMS amplitude
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (timeData[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Detect onset
      const onset = rms > onsetThreshold && prevAmplitudeRef.current < onsetThreshold;
      prevAmplitudeRef.current = rms;

      setAmplitude(rms);
      setFrequencies(new Float32Array(freqData));
      setIsOnset(onset);

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => cancelAnimationFrame(animationRef.current);
  }, [audioMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  const audioData = { amplitude, frequencies, isOnset };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b border-white/10">
        <h1 className="text-xl font-serif text-white/90">Particle Effects Test</h1>
      </div>

      {/* Effects Row */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minWidth: "min-content" }}>
          {EFFECTS.map(({ type, label }) => (
            <div key={type} className="flex flex-col items-center gap-3">
              <span className="text-sm text-white/60 font-mono">{label}</span>
              <div className="relative">
                <ParticleLogoEffect
                  size={220}
                  effect={type}
                  audioData={audioData}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          {/* Amplitude Meter */}
          <div className="w-full max-w-md">
            <div className="text-xs text-white/40 mb-1 font-mono">Amplitude</div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-75"
                style={{ width: `${Math.min(100, amplitude * 100)}%` }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (audioMode === "synthetic") {
                  stopAudio();
                } else {
                  stopAudio();
                  startSyntheticSpeech();
                }
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                audioMode === "synthetic"
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {audioMode === "synthetic" ? "Stop Simulation" : "Simulate Speech"}
            </button>

            <button
              onClick={() => {
                if (audioMode === "mic") {
                  stopAudio();
                } else {
                  stopAudio();
                  startMicrophone();
                }
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                audioMode === "mic"
                  ? "bg-green-500 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {audioMode === "mic" ? "🎤 Mic Active" : "Use Microphone"}
            </button>
          </div>

          <p className="text-white/30 text-sm text-center">
            All 5 effects respond to the same audio input simultaneously
          </p>
        </div>
      </div>
    </div>
  );
}
