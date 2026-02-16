"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { joinRoom } from "@/lib/actions";
import GoldDust from "@/components/GoldDust";

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const num = parseInt(number, 10);
    if (!roomCode.trim() || roomCode.trim().length !== 6) {
      setError("Enter a valid 6-character room code");
      return;
    }
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (isNaN(num) || num < 1 || num > 100) {
      setError("Number must be between 1 and 100");
      return;
    }

    setLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout - try again")), 15000)
      );
      
      const result = await Promise.race([joinRoom(roomCode.trim().toUpperCase(), name.trim()), timeoutPromise]) as any;

      if (result.success && result.playerId) {
        sessionStorage.setItem(`player_${roomCode.trim().toUpperCase()}`, result.playerId);
        sessionStorage.setItem(`player_number_${roomCode.trim().toUpperCase()}`, number);
        sessionStorage.setItem(`player_name_${roomCode.trim().toUpperCase()}`, name.trim());
        router.push(`/room/${roomCode.trim().toUpperCase()}?playerId=${result.playerId}&number=${num}`);
      } else {
        setError(result.error || "Failed to join room");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Network error - check your connection");
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
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-3xl md:text-4xl text-gold mb-3 text-center">
          Join the Masquerade
        </h1>
        <p className="text-white/40 font-sans text-sm mb-10 text-center">
          Enter the room code and make your choice.
        </p>

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-gold/60 text-xs font-sans uppercase tracking-wider mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="XXXXXX"
              className="w-full px-4 py-3 bg-masquerade-card border border-gold/20 rounded-sm text-white font-mono text-center text-lg tracking-[0.3em] placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
            />
          </div>

          <div>
            <label className="block text-gold/60 text-xs font-sans uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-masquerade-card border border-gold/20 rounded-sm text-white font-sans placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
            />
          </div>

          <div>
            <label className="block text-gold/60 text-xs font-sans uppercase tracking-wider mb-2">
              Your Number (1–100)
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              min={1}
              max={100}
              placeholder="Choose wisely..."
              className="w-full px-4 py-3 bg-masquerade-card border border-gold/20 rounded-sm text-white font-mono text-center text-lg placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm font-sans text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-transparent border border-gold text-gold font-sans font-medium text-base rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                Joining...
              </span>
            ) : (
              "Enter the Masquerade"
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-gold/40 text-sm font-sans hover:text-gold/60 transition-colors"
          >
            &larr; Back
          </button>
        </div>
      </motion.div>
    </main>
  );
}
