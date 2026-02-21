"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import GoldDust from "@/components/GoldDust";

function playSpinSound(duration: number) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const totalTicks = 60;
  const times: number[] = [];

  // Generate tick times that decelerate (matching the wheel's cubic-bezier easing)
  for (let i = 0; i < totalTicks; i++) {
    const t = i / totalTicks;
    // Ease-out curve: ticks bunch up early, spread out late
    const mapped = 1 - Math.pow(1 - t, 3);
    times.push(mapped * duration);
  }

  times.forEach((time, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Higher pitch tick, slight variation for realism
    osc.frequency.value = 1800 + Math.random() * 400;
    osc.type = "sine";

    // Later ticks are louder and slightly longer (more prominent as wheel slows)
    const progress = i / totalTicks;
    const vol = 0.04 + progress * 0.1;
    const tickLen = 0.012 + progress * 0.025;

    gain.gain.setValueAtTime(0, ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + tickLen);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + tickLen + 0.01);
  });

  // Final "ding" when the wheel stops
  const ding = ctx.createOscillator();
  const dingGain = ctx.createGain();
  ding.connect(dingGain);
  dingGain.connect(ctx.destination);
  ding.frequency.value = 880;
  ding.type = "sine";
  dingGain.gain.setValueAtTime(0, ctx.currentTime + duration);
  dingGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + duration + 0.01);
  dingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + 0.6);
  ding.start(ctx.currentTime + duration);
  ding.stop(ctx.currentTime + duration + 0.7);

  setTimeout(() => ctx.close(), (duration + 1) * 1000);
}

const names = [
  "Alexander", "Seraphina", "Maximilian", "Victoria",
  "Nathaniel", "Cordelia", "Dominic", "Serena",
  "Julian", "Aurora", "Vincent", "Ophelia"
];

const SEGMENT_COLORS = [
  "#1a0f1f", "#101822", "#1c1218", "#0e1a1a",
  "#1a1018", "#111a20", "#1a0f1f", "#101822",
  "#1c1218", "#0e1a1a", "#1a1018", "#111a20",
];

export default function MatchmakerPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [availableNames, setAvailableNames] = useState(names.slice(0, 12));
  const [removedNames, setRemovedNames] = useState<string[]>([]);

  const wheelBackground = useMemo(() => {
    if (availableNames.length === 0) return "#0b0b0f";
    const seg = 360 / availableNames.length;
    const line = 0.6;
    const stops: string[] = [];

    availableNames.forEach((_, i) => {
      const start = i * seg;
      const end = (i + 1) * seg;
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      stops.push(`#D4AF37 ${start}deg ${start + line}deg`);
      stops.push(`${color} ${start + line}deg ${end}deg`);
    });
    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [availableNames]);

  const tickMarks = useMemo(() => {
    if (availableNames.length === 0) return [];
    const seg = 360 / availableNames.length;
    return availableNames.map((_, i) => i * seg);
  }, [availableNames]);

  const spinWheel = () => {
    if (isSpinning || availableNames.length === 0) return;

    setIsSpinning(true);
    setSelectedName(null);

    const segmentAngle = 360 / availableNames.length;
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    const selected = availableNames[randomIndex];

    const targetMidPoint = (randomIndex * segmentAngle) + (segmentAngle / 2);
    const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
    const totalRotation = extraSpins + (360 - targetMidPoint);

    setRotation(totalRotation);
    playSpinSound(4);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedName(selected);
      setAvailableNames((prev) => prev.filter((_, index) => index !== randomIndex));
      setRemovedNames((prev) => [...prev, selected]);
      setRotation(0);
    }, 4100);
  };

  const restartWheel = () => {
    setAvailableNames(names.slice(0, 12));
    setRemovedNames([]);
    setSelectedName(null);
    setRotation(0);
    setIsSpinning(false);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <GoldDust count={60} />

      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse at center, rgba(212,175,55,0.05) 0%, transparent 50%)",
      }} />

      <Link
        href="/"
        className="fixed top-4 left-4 z-50 px-3 py-2 bg-transparent border border-gold/60 text-gold/80 font-sans text-xs rounded-sm transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
      >
        &larr; Back
      </Link>

      <motion.div
        className="relative z-10 text-center max-w-5xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-12 h-0.5 bg-gold/40 mx-auto mb-5"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gold mb-2 tracking-tight">
          The Matchmaker
        </h1>
        <p className="font-serif text-sm sm:text-base text-gold/40 italic mb-10">
          Let fate decide
        </p>

        <div className="flex flex-col items-center justify-center">
          {/* Wheel area */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px]">

              {/* Outer decorative ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.05), rgba(212,175,55,0.3))",
                  padding: "3px",
                }}
              >
                <div className="w-full h-full rounded-full bg-masquerade-bg" />
              </div>

              {/* Animated glow ring */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none"
                animate={{
                  boxShadow: isSpinning
                    ? [
                        "0 0 30px rgba(212,175,55,0.2), inset 0 0 30px rgba(212,175,55,0.05)",
                        "0 0 60px rgba(212,175,55,0.5), inset 0 0 60px rgba(212,175,55,0.1)",
                        "0 0 30px rgba(212,175,55,0.2), inset 0 0 30px rgba(212,175,55,0.05)",
                      ]
                    : "0 0 40px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.03)"
                }}
                transition={{ duration: 1, repeat: isSpinning ? Infinity : 0, ease: "easeInOut" }}
              />

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 flex flex-col items-center">
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "14px solid transparent",
                    borderRight: "14px solid transparent",
                    borderTop: "28px solid #D4AF37",
                    filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  }}
                />
                <div className="w-0.5 h-2 bg-gold/60 -mt-0.5" />
              </div>

              {/* The spinning wheel */}
              <motion.div
                className="absolute inset-[6px] rounded-full overflow-hidden"
                style={{ background: wheelBackground }}
                animate={{ rotate: rotation }}
                transition={{
                  duration: isSpinning ? 4 : 0,
                  ease: [0.17, 0.67, 0.12, 0.99]
                }}
              >
                {/* Outer gold bevel */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 4px rgba(212,175,55,0.4), inset 0 0 20px rgba(0,0,0,0.5)",
                  }}
                />

                {/* Tick marks at segment boundaries */}
                {tickMarks.map((deg) => (
                  <div
                    key={`tick-${deg}`}
                    className="absolute left-1/2 top-0 origin-bottom pointer-events-none"
                    style={{
                      height: "50%",
                      width: "2px",
                      transform: `translateX(-50%) rotate(${deg}deg)`,
                    }}
                  >
                    <div className="w-full h-3 bg-gradient-to-b from-gold/70 to-transparent rounded-b-full" />
                  </div>
                ))}

                {/* Name labels */}
                {availableNames.map((name, index) => {
                  const segmentSize = 360 / availableNames.length;
                  const angle = (index * segmentSize) + (segmentSize / 2) - 90;
                  const radian = (angle * Math.PI) / 180;
                  const x = 50 + 33 * Math.cos(radian);
                  const y = 50 + 33 * Math.sin(radian);

                  return (
                    <div
                      key={`${name}-${availableNames.length}`}
                      className="absolute font-serif text-[10px] sm:text-xs font-semibold pointer-events-none whitespace-nowrap"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                        color: "#f0e6c8",
                        textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 12px rgba(212,175,55,0.2)",
                      }}
                    >
                      {name}
                    </div>
                  );
                })}

                {/* Center hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle, #1a1520 0%, #0f0d14 70%)",
                      boxShadow: "0 0 0 3px rgba(212,175,55,0.5), 0 0 0 5px rgba(212,175,55,0.15), 0 0 20px rgba(0,0,0,0.8), inset 0 0 15px rgba(212,175,55,0.1)",
                    }}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
                        border: "1px solid rgba(212,175,55,0.3)",
                      }}
                    >
                      <span className="font-serif text-gold/70 text-xs sm:text-sm tracking-widest">
                        BE
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-10">
              <motion.button
                onClick={spinWheel}
                disabled={isSpinning || availableNames.length === 0}
                className="relative px-8 py-3.5 border border-gold text-gold font-sans text-sm font-medium rounded-sm transition-all duration-300 hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.96 }}
                style={{
                  boxShadow: isSpinning
                    ? "0 0 25px rgba(212,175,55,0.3)"
                    : "0 0 15px rgba(212,175,55,0.1)",
                }}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                    The wheel turns&hellip;
                  </span>
                ) : (
                  "Spin the Wheel"
                )}
              </motion.button>

              <button
                onClick={restartWheel}
                disabled={isSpinning}
                className="px-6 py-3.5 border border-white/10 text-white/30 font-sans text-sm rounded-sm transition-all duration-300 hover:border-gold/40 hover:text-gold/60 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Result + history */}
          <div className="w-full max-w-md flex flex-col items-center gap-8 mt-8">
            {/* Result reveal */}
            <AnimatePresence mode="wait">
              {selectedName && !isSpinning ? (
                <motion.div
                  key={selectedName}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full text-center"
                >
                  <p className="text-white/30 font-sans text-[10px] uppercase tracking-[0.2em] mb-1.5">
                    Destiny has chosen
                  </p>
                  <div
                    className="relative inline-block"
                    style={{
                      textShadow: "0 0 30px rgba(212,175,55,0.4)",
                    }}
                  >
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-gold">
                      {selectedName}
                    </p>
                  </div>
                  <div className="w-10 h-px bg-gold/30 mt-3 mx-auto" />
                </motion.div>
              ) : isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center"
                >
                  <p className="text-gold/30 font-serif text-sm italic">
                    The wheel turns&hellip;
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center"
                >
                  <p className="text-white/20 font-sans text-xs">
                    {availableNames.length === 0
                      ? "All names have been drawn"
                      : `${availableNames.length} names remain`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previously chosen */}
            {removedNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full text-center"
              >
                <p className="text-white/20 font-sans text-[10px] uppercase tracking-[0.2em] mb-3">
                  Previously Chosen
                </p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                  {removedNames.map((name, i) => (
                    <motion.p
                      key={name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="font-serif text-sm text-gold/30"
                    >
                      {name}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
