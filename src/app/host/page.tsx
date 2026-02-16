"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createRoom } from "@/lib/actions";
import GoldDust from "@/components/GoldDust";

export default function HostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    const result = await createRoom();

    if (result.success && result.code && result.hostToken) {
      sessionStorage.setItem(`host_${result.code}`, result.hostToken);
      router.push(`/room/${result.code}`);
    } else {
      setError(result.error || "Failed to create room");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <GoldDust count={30} />

      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 60%)",
      }} />

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-3xl md:text-4xl text-gold mb-3">
          Host a Masquerade
        </h1>
        <p className="text-white/40 font-sans text-sm mb-10">
          Create a room and invite players to join your game.
        </p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mb-4 font-sans"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleCreate}
          disabled={loading}
          className="w-full px-8 py-4 bg-transparent border border-gold text-gold font-sans font-medium text-base rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            "Create Room"
          )}
        </motion.button>

        <button
          onClick={() => router.push("/")}
          className="mt-6 text-gold/40 text-sm font-sans hover:text-gold/60 transition-colors"
        >
          &larr; Back
        </button>
      </motion.div>
    </main>
  );
}
