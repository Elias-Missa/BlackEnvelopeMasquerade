"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/types";
import CountUp from "./CountUp";
import GoldConfetti from "./GoldConfetti";

interface RevealSequenceProps {
  players: Player[];
}

type Phase =
  | "dark"
  | "players"
  | "pause"
  | "average"
  | "twoThirds"
  | "winner";

export default function RevealSequence({ players }: RevealSequenceProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [visiblePlayers, setVisiblePlayers] = useState(0);
  const [showAverage, setShowAverage] = useState(false);
  const [showTwoThirds, setShowTwoThirds] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const numbers = players.map((p) => p.number!);
  const average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const twoThirds = (2 / 3) * average;

  const getWinners = useCallback(() => {
    let minDist = Infinity;
    players.forEach((p) => {
      const dist = Math.abs(p.number! - twoThirds);
      if (dist < minDist) minDist = dist;
    });
    return players.filter(
      (p) => Math.abs(p.number! - twoThirds) === minDist
    );
  }, [players, twoThirds]);

  const winners = getWinners();

  useEffect(() => {
    const timer = setTimeout(() => setPhase("players"), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "players") return;
    if (visiblePlayers < players.length) {
      const timer = setTimeout(
        () => setVisiblePlayers((v) => v + 1),
        400
      );
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase("pause"), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, visiblePlayers, players.length]);

  useEffect(() => {
    if (phase !== "pause") return;
    const timer = setTimeout(() => {
      setPhase("average");
      setShowAverage(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleAverageComplete = useCallback(() => {
    setTimeout(() => {
      setPhase("twoThirds");
      setShowTwoThirds(true);
    }, 1000);
  }, []);

  const handleTwoThirdsComplete = useCallback(() => {
    setTimeout(() => {
      setPhase("winner");
      setShowWinner(true);
      setTimeout(() => setConfettiActive(true), 500);
    }, 1200);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <GoldConfetti active={confettiActive} />

      <motion.div
        className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === "dark" && (
            <motion.div
              key="dark"
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-4 h-4 rounded-full bg-gold animate-gold-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== "dark" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-center font-serif text-2xl md:text-3xl text-gold mb-8">
              The Numbers Are Revealed
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={
                    index < visiblePlayers
                      ? { opacity: 1, rotateY: 0 }
                      : { opacity: 0, rotateY: 180 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className={`border rounded-lg p-4 text-center transition-all duration-500 w-36 sm:w-40 ${
                    showWinner &&
                    winners.some((w) => w.id === player.id)
                      ? "border-gold bg-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                      : "border-gold/20 bg-masquerade-card"
                  }`}
                >
                  <p className="text-sm text-gold/70 font-sans truncate">
                    {player.name}
                  </p>
                  <p className="text-2xl font-serif text-white mt-1">
                    {player.number}
                  </p>
                </motion.div>
              ))}
            </div>

            {showAverage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6"
              >
                <p className="text-lg text-gold/60 font-sans mb-2">
                  Average
                </p>
                <p className="text-4xl md:text-5xl font-serif">
                  <CountUp
                    target={average}
                    duration={2}
                    onComplete={handleAverageComplete}
                  />
                </p>
              </motion.div>
            )}

            {showTwoThirds && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10"
              >
                <p className="text-lg text-gold/60 font-sans mb-2">
                  Two-Thirds of Average
                </p>
                <p className="text-4xl md:text-5xl font-serif">
                  <CountUp
                    target={twoThirds}
                    duration={2}
                    onComplete={handleTwoThirdsComplete}
                  />
                </p>
              </motion.div>
            )}

            {showWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-center"
              >
                <motion.p
                  className="text-xl text-gold/80 font-serif italic mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  The Envelope Chooses...
                </motion.p>

                {winners.map((winner) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.6,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mb-4"
                  >
                    <motion.h3
                      className="text-4xl md:text-6xl font-serif text-gold font-bold"
                      animate={{
                        textShadow: [
                          "0 0 20px rgba(212,175,55,0.5)",
                          "0 0 40px rgba(212,175,55,0.8)",
                          "0 0 20px rgba(212,175,55,0.5)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {winner.name}
                    </motion.h3>
                    <p className="text-xl text-white/80 mt-2 font-sans">
                      Chose{" "}
                      <span className="text-gold font-bold">
                        {winner.number}
                      </span>
                    </p>
                    <p className="text-sm text-gold/50 mt-1 font-sans">
                      Distance from target:{" "}
                      {Math.abs(winner.number! - twoThirds).toFixed(2)}
                    </p>
                  </motion.div>
                ))}

                {winners.length > 1 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-gold/60 text-sm font-sans mt-2"
                  >
                    A rare tie — multiple victors emerge from the masquerade.
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
