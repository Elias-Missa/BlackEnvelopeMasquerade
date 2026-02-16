"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountUpProps {
  target: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  onComplete?: () => void;
}

export default function CountUp({
  target,
  duration = 2,
  decimals = 2,
  prefix = "",
  onComplete,
}: CountUpProps) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;

      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCurrent(target);
        setDone(true);
        onComplete?.();
      }
    };

    requestAnimationFrame(tick);
  }, [target, duration, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`font-mono text-gold tabular-nums ${done ? "text-gold-light" : ""}`}
    >
      {prefix}
      {current.toFixed(decimals)}
    </motion.span>
  );
}
