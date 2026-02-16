"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { submitNumber, revealResults, getRoomData, restartGame } from "@/lib/actions";
import type { Room, Player } from "@/lib/types";
import GoldDust from "@/components/GoldDust";
import RevealSequence from "@/components/RevealSequence";

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [hostToken, setHostToken] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittingNumber, setSubmittingNumber] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const data = await getRoomData(code);
    if (data) {
      setRoom(data.room as Room);
      setPlayers(data.players as Player[]);
    }
    setLoading(false);
  }, [code]);

  useEffect(() => {
    const token = sessionStorage.getItem(`host_${code}`);
    if (token) {
      setIsHost(true);
      setHostToken(token);
    }

    const pid = sessionStorage.getItem(`player_${code}`);
    if (pid) {
      setPlayerId(pid);
    }

    fetchData();
  }, [code, fetchData]);

  useEffect(() => {
    if (!room) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new as Room);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, fetchData]);

  useEffect(() => {
    if (playerId && players.length > 0) {
      const me = players.find((p) => p.id === playerId);
      if (me && me.number !== null) {
        setHasSubmitted(true);
      }
    }
  }, [playerId, players]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlayerId = urlParams.get("playerId");
    const urlNumber = urlParams.get("number");

    if (urlPlayerId && urlNumber && !hasSubmitted) {
      const num = parseInt(urlNumber, 10);
      if (num >= 1 && num <= 100) {
        setPlayerId(urlPlayerId);
        submitNumber(urlPlayerId, num).then((result) => {
          if (result.success) {
            setHasSubmitted(true);
            fetchData();
          }
        });
      }
      window.history.replaceState({}, "", `/room/${code}`);
    }
  }, [code, hasSubmitted, fetchData]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReveal = async () => {
    setRevealLoading(true);
    setError("");
    const result = await revealResults(code, hostToken);
    if (!result.success) {
      setError(result.error || "Failed to reveal");
      setRevealLoading(false);
    } else {
      fetchData();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-masquerade-bg">
        <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-masquerade-bg px-4">
        <h1 className="font-serif text-2xl text-gold mb-4">Room Not Found</h1>
        <p className="text-white/40 font-sans text-sm">
          This room does not exist or has expired.
        </p>
      </main>
    );
  }

  const handleRestart = async () => {
    if (!isHost) return;
    const result = await restartGame(code, hostToken);
    if (result.success) {
      sessionStorage.removeItem(`player_${code}`);
      setPlayerId("");
      setHasSubmitted(false);
      fetchData();
    }
  };

  if (room.status === "revealed") {
    const allHaveNumbers = players.every((p) => p.number !== null);
    if (allHaveNumbers && players.length >= 3) {
      return (
        <main className="min-h-screen bg-masquerade-bg relative">
          <GoldDust count={20} />
          <RevealSequence players={players} />
          {isHost && (
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
              <motion.button
                onClick={handleRestart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 8, duration: 0.6 }}
                className="px-8 py-3 bg-masquerade-card border border-gold/50 text-gold font-sans text-sm rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Restart Masquerade
              </motion.button>
            </div>
          )}
        </main>
      );
    }
  }

  const allSubmitted = players.length >= 3 && players.every((p) => p.number !== null);
  const submittedCount = players.filter((p) => p.number !== null).length;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <GoldDust count={25} />

      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl text-gold mb-2">
            The Masquerade Awaits
          </h1>
          <p className="text-white/40 font-sans text-sm">
            Share the room code with your players
          </p>
        </div>

        <div className="bg-masquerade-card border border-gold/20 rounded-sm p-6 mb-6">
          <p className="text-gold/60 text-xs font-sans uppercase tracking-wider mb-3 text-center">
            Room Code
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl md:text-4xl font-mono text-gold tracking-[0.4em] font-bold">
              {code}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs border border-gold/30 text-gold/70 rounded-sm hover:bg-gold/10 transition-all font-sans"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="bg-masquerade-card border border-gold/20 rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gold/60 text-xs font-sans uppercase tracking-wider">
              Players ({players.length})
            </p>
            <p className="text-gold/40 text-xs font-sans">
              {submittedCount}/{players.length} submitted
            </p>
          </div>

          <AnimatePresence>
            {players.length === 0 ? (
              <p className="text-white/30 text-sm font-sans text-center py-4">
                Waiting for players to join...
              </p>
            ) : (
              <div className="space-y-2">
                {players.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-2 px-3 rounded bg-masquerade-bg/50"
                  >
                    <span className="text-white/80 font-sans text-sm">
                      {player.name}
                    </span>
                    <span className="text-xs font-sans">
                      {player.number !== null ? (
                        <span className="text-green-400/70">&#10003; Submitted</span>
                      ) : (
                        <span className="text-gold/30">Waiting...</span>
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {!isHost && !playerId && (
          <div className="bg-masquerade-card border border-gold/20 rounded-sm p-6 mb-6 text-center">
            <p className="text-white/50 font-sans text-sm">
              You are viewing this room. To play, join from the{" "}
              <a href="/join" className="text-gold underline underline-offset-2">
                Join page
              </a>
              .
            </p>
          </div>
        )}

        {playerId && !hasSubmitted && (
          <div className="bg-masquerade-card border border-gold/20 rounded-sm p-6 mb-6 text-center">
            <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gold/60 font-sans text-sm">
              Submitting your number...
            </p>
          </div>
        )}

        {playerId && hasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-masquerade-card border border-gold/20 rounded-sm p-6 mb-6 text-center"
          >
            <p className="text-gold font-sans text-sm">
              &#10003; Your number has been submitted
            </p>
            <p className="text-white/30 text-xs font-sans mt-2">
              Waiting for the host to reveal results...
            </p>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm font-sans text-center mb-4"
          >
            {error}
          </motion.p>
        )}

        {isHost && (
          <motion.button
            onClick={handleReveal}
            disabled={!allSubmitted || revealLoading}
            className="w-full px-8 py-4 bg-transparent border border-gold text-gold font-sans font-medium text-base rounded-sm transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
            whileTap={allSubmitted ? { scale: 0.98 } : undefined}
          >
            {revealLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                Revealing...
              </span>
            ) : !allSubmitted ? (
              `Waiting for submissions (${submittedCount}/${players.length})${players.length < 3 ? " — Need 3+ players" : ""}`
            ) : (
              "Reveal Results"
            )}
          </motion.button>
        )}

        {isHost && players.length < 3 && (
          <p className="text-gold/30 text-xs font-sans text-center mt-3">
            Minimum 3 players required to begin
          </p>
        )}
      </motion.div>
    </main>
  );
}
