"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GoldDust from "@/components/GoldDust";

const names = [
  "Alexander", "Seraphina", "Maximilian", "Victoria",
  "Nathaniel", "Cordelia", "Dominic", "Serena",
  "Julian", "Aurora", "Vincent", "Ophelia"
];

export default function MatchmakerPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [availableNames, setAvailableNames] = useState(names.slice(0, 12));
  const [removedNames, setRemovedNames] = useState<string[]>([]);

  // Generate the CSS conic-gradient string for hard-edged segments
  const wheelBackground = useMemo(() => {
    if (availableNames.length === 0) return "#0b0b0f";
    const segmentSize = 360 / availableNames.length;
    const stops = availableNames.map((_, i) => {
      const color = i % 2 === 0 ? '#D4AF37' : '#1a1a22';
      return `${color} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`;
    });
    return `conic-gradient(from 0deg, ${stops.join(', ')})`;
  }, [availableNames]);

  const spinWheel = () => {
    if (isSpinning || availableNames.length === 0) return;

    setIsSpinning(true);
    setSelectedName(null);
    
    const segmentAngle = 360 / availableNames.length;
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    
    // Calculate the angle to put the center of the segment at the top (0°)
    // We subtract from 360 to rotate counter-clockwise
    const targetMidPoint = (randomIndex * segmentAngle) + (segmentAngle / 2);
    const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
    const totalRotation = extraSpins + (360 - targetMidPoint);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const selected = availableNames[randomIndex];
      setSelectedName(selected);
      
      setAvailableNames(prev => prev.filter((_, index) => index !== randomIndex));
      setRemovedNames(prev => [...prev, selected]);
    }, 4000);
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
      <GoldDust count={50} />

      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 60%)",
      }} />

      <Link
        href="/"
        className="fixed top-4 left-4 z-50 px-3 py-2 bg-transparent border border-gold/60 text-gold/80 font-sans text-xs rounded-sm transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
      >
        ← Back
      </Link>

      <motion.div
        className="relative z-10 text-center max-w-4xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-gold mb-12">
          The Matchmaker
        </h1>

        <div className="relative flex flex-col items-center">
          <div className="relative w-80 h-80 sm:w-96 sm:h-96">
            {/* Pointer at the very top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-xl" />
            </div>

            {/* The actual spinning wheel */}
            <motion.div
              className="relative w-full h-full rounded-full border-8 border-gold shadow-[0_0_60px_rgba(212,175,55,0.4)]"
              style={{
                background: wheelBackground,
                rotate: `${rotation}deg` 
              }}
              transition={{
                duration: isSpinning ? 4 : 0,
                ease: [0.17, 0.67, 0.12, 0.99]
              }}
            >
              {availableNames.map((name, index) => {
                const segmentSize = 360 / availableNames.length;
                // Position text at the center of the slice
                // Subtract 90 to convert Math.cos/sin (starting at 3 o'clock) 
                // to our wheel (starting at 12 o'clock)
                const angle = (index * segmentSize) + (segmentSize / 2) - 90;
                const radian = (angle * Math.PI) / 180;
                const x = 50 + 35 * Math.cos(radian);
                const y = 50 + 35 * Math.sin(radian);
                
                return (
                  <div
                    key={`${name}-${availableNames.length}`}
                    className="absolute text-white font-serif text-xs sm:text-sm font-bold pointer-events-none"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                    }}
                  >
                    {name}
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning || availableNames.length === 0}
              className="px-8 py-4 border border-gold text-gold font-sans rounded-sm hover:bg-gold/10 disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
            >
              {isSpinning ? "The wheel turns..." : "Spin the Wheel"}
            </motion.button>

            <button
              onClick={restartWheel}
              disabled={isSpinning}
              className="px-8 py-4 border border-gold/40 text-gold/60 font-sans rounded-sm hover:border-gold hover:text-gold disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {selectedName && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <p className="text-gold/60 font-serif italic">Destiny has chosen:</p>
              <p className="font-serif text-4xl font-bold text-gold">{selectedName}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
