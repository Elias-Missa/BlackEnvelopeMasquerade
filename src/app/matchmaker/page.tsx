"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GoldDust from "@/components/GoldDust";

const names = [
  "Alexander",
  "Seraphina", 
  "Maximilian",
  "Victoria",
  "Nathaniel",
  "Cordelia",
  "Dominic",
  "Serena",
  "Julian",
  "Aurora",
  "Vincent",
  "Ophelia"
];

export default function MatchmakerPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [availableNames, setAvailableNames] = useState(names.slice(0, 12)); // Always start with 12 names
  const [removedNames, setRemovedNames] = useState<string[]>([]);

  const spinWheel = () => {
    if (isSpinning || availableNames.length === 0) return;

    setIsSpinning(true);
    setSelectedName(null);
    
    const spins = Math.floor(Math.random() * 5) + 5;
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    const segmentAngle = 360 / availableNames.length;
    
    // Calculate the correct angle so the pointer lands on the selected name
    // The pointer is at the top (0 degrees), so we need to rotate so the selected name is at the top
    // Names are positioned clockwise starting from the top
    const nameAngle = randomIndex * segmentAngle;
    const targetAngle = 360 - nameAngle; // Rotate counter-clockwise to put the name at the top
    const totalRotation = spins * 360 + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const selected = availableNames[randomIndex];
      setSelectedName(selected);
      
      // Remove the selected name from available names
      setAvailableNames(prev => prev.filter((_, index) => index !== randomIndex));
      setRemovedNames(prev => [...prev, selected]);
    }, 4000);
  };

  const restartWheel = () => {
    setAvailableNames(names.slice(0, 12)); // Always reset to 12 names
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
        <motion.h1
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-gold leading-tight tracking-tight mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          The Matchmaker
        </motion.h1>

        <div className="relative flex flex-col items-center">
          <div className="relative w-80 h-80 sm:w-96 sm:h-96">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 blur-xl"></div>
            
            <motion.div
              className="relative w-full h-full rounded-full border-8 border-gold shadow-[0_0_60px_rgba(212,175,55,0.4)] overflow-hidden"
              style={{
                background: availableNames.length > 0 ? 
                  `conic-gradient(from 0deg, ${availableNames.map((_, index) => 
                    index % 2 === 0 ? '#D4AF37' : '#0b0b0f'
                  ).join(' ')} 0deg 360deg)` : 
                  '#0b0b0f',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {availableNames.map((name, index) => {
                const angle = (index * 360) / availableNames.length + 360 / availableNames.length / 2;
                const radian = (angle * Math.PI) / 180;
                const x = 50 + 40 * Math.cos(radian);
                const y = 50 + 40 * Math.sin(radian);
                
                return (
                  <div
                    key={index}
                    className="absolute text-gold font-serif text-sm font-bold"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                    }}
                  >
                    {name}
                  </div>
                );
              })}
            </motion.div>

            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-gold drop-shadow-[0_4px_8px_rgba(212,175,55,0.4)]"></div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning || availableNames.length === 0}
              className="px-8 py-4 bg-transparent border border-gold text-gold font-sans font-medium text-base rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: (isSpinning || availableNames.length === 0) ? 1 : 1.05 }}
              whileTap={{ scale: (isSpinning || availableNames.length === 0) ? 1 : 0.95 }}
            >
              {isSpinning ? "Spinning..." : availableNames.length === 0 ? "No More Names" : "Spin the Wheel"}
            </motion.button>

            <motion.button
              onClick={restartWheel}
              disabled={isSpinning}
              className="px-8 py-4 bg-transparent border border-gold/60 text-gold/80 font-sans font-medium text-base rounded-sm transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSpinning ? 1 : 1.05 }}
              whileTap={{ scale: isSpinning ? 1 : 0.95 }}
            >
              Restart Wheel
            </motion.button>
          </div>

          {selectedName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gold/60 font-serif text-lg mb-2">The wheel has chosen:</p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-gold">{selectedName}</p>
            </motion.div>
          )}

          {removedNames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-center max-w-md"
            >
              <p className="text-gold/40 font-serif text-sm mb-2">Already chosen:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {removedNames.map((name, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gold/10 border border-gold/30 text-gold/60 font-serif text-xs rounded-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
