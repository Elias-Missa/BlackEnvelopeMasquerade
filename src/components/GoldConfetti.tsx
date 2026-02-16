"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  color: string;
}

const GOLD_SHADES = [
  "#D4AF37",
  "#E8D48B",
  "#B8960C",
  "#F0E68C",
  "#DAA520",
  "#FFD700",
  "#C5A028",
];

export default function GoldConfetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) return;
    const confetti: ConfettiPiece[] = [];
    for (let i = 0; i < 80; i++) {
      confetti.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        color: GOLD_SHADES[Math.floor(Math.random() * GOLD_SHADES.length)],
      });
    }
    setPieces(confetti);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: "1px",
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
