"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GoldDust from "@/components/GoldDust";

export default function LandingPage() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <GoldDust count={50} />

        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 60%)",
        }} />

        <motion.div
          className="relative z-10 text-center max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="w-16 h-0.5 bg-gold/40 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <motion.h1
            className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-gold leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            The Black Envelope
            <br />
            Masquerade
          </motion.h1>

          <motion.p
            className="font-serif text-lg sm:text-xl md:text-2xl text-gold/60 italic mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            The Consensus
          </motion.p>

          <motion.div
            className="w-16 h-0.5 bg-gold/40 mx-auto mt-8 mb-10"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 1, delay: 0.9 }}
          />

          <motion.p
            className="text-white/50 font-sans text-sm md:text-base max-w-md mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            A game of strategy and perception. Choose wisely — for the envelope
            reveals all.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <Link
              href="/host"
              className="group relative px-8 py-4 bg-transparent border border-gold text-gold font-sans font-medium text-base rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Host a Masquerade
            </Link>
            <Link
              href="/join"
              className="group relative px-8 py-4 bg-transparent border border-gold/40 text-gold/80 font-sans font-medium text-base rounded-sm transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Join the Masquerade
            </Link>
          </motion.div>

          <Link
            href="/matchmaker"
            className="fixed top-4 right-4 z-50 px-3 py-2 bg-transparent border border-gold/60 text-gold/80 font-sans text-xs rounded-sm transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Matchmaker
          </Link>
        </motion.div>
      </main>
    </>
  );
}
