"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./sparkles-button.module.css";

interface Sparkle {
  id: number;
  kind: "burst" | "trail";
  /** Origin, relative to the button's top-left corner (px). */
  x: number;
  y: number;
  /** Where the particle ends up, relative to its origin (px). */
  dx: number;
  dy: number;
  size: number;
  tone: number; // index into the theme-aware .tone0-3 classes
  rotation: number;
}

const BURST_COUNT = 12;
const BURST_DURATION = 0.7; // s
const TRAIL_DURATION = 0.6; // s
const TONES = 4;
const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const;

let sparkleId = 0;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// All randomness happens here, once per particle, at creation time (never during render).
function createBurstParticle(x: number, y: number, i: number): Sparkle {
  // Evenly spaced angles around the origin, each jittered by up to ±half a slot.
  const slot = (Math.PI * 2) / BURST_COUNT;
  const angle = i * slot + randomBetween(-slot / 2, slot / 2);
  const distance = randomBetween(30, 70);
  return {
    id: sparkleId++,
    kind: "burst",
    x,
    y,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    size: randomBetween(8, 16),
    tone: Math.floor(Math.random() * TONES),
    rotation: Math.random() * 360,
  };
}

function createTrailParticle(x: number, y: number): Sparkle {
  return {
    id: sparkleId++,
    kind: "trail",
    x: x + randomBetween(-10, 10),
    y: y + randomBetween(-10, 10),
    dx: randomBetween(-15, 15),
    dy: -randomBetween(20, 50), // trail sparkles float upward
    size: randomBetween(6, 12),
    tone: Math.floor(Math.random() * TONES),
    rotation: Math.random() * 360,
  };
}

export function SparklesButton({
  children = "Sparkle Me",
  onClick,
}: {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const timeouts = useRef(new Set<ReturnType<typeof setTimeout>>());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const pending = timeouts.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const spawn = useCallback((batch: Sparkle[], lifetimeMs: number) => {
    const ids = new Set(batch.map((s) => s.id));
    setSparkles((prev) => [...prev, ...batch]);
    const t = setTimeout(() => {
      timeouts.current.delete(t);
      setSparkles((prev) => prev.filter((s) => !ids.has(s.id)));
    }, lifetimeMs);
    timeouts.current.add(t);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // detail === 0 means keyboard activation (Enter/Space): clientX/Y are 0,
    // so burst from the button's centre instead of the page's top-left corner.
    const keyboard = e.detail === 0;
    const x = keyboard ? rect.width / 2 : e.clientX - rect.left;
    const y = keyboard ? rect.height / 2 : e.clientY - rect.top;
    spawn(
      Array.from({ length: BURST_COUNT }, (_, i) => createBurstParticle(x, y, i)),
      BURST_DURATION * 1000
    );
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || Math.random() > 0.6) return; // ~60% of move events leave a sparkle
    const rect = e.currentTarget.getBoundingClientRect();
    spawn(
      [createTrailParticle(e.clientX - rect.left, e.clientY - rect.top)],
      TRAIL_DURATION * 1000
    );
  };

  return (
    <motion.button
      type="button"
      className={styles.button}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className={styles.label}>{children}</span>
      {sparkles.map((s) => (
        <motion.svg
          key={s.id}
          aria-hidden
          className={`${styles.sparkle} ${styles[`tone${s.tone}`]}`}
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
          }}
          viewBox="0 0 24 24"
          initial={{ x: 0, y: 0, scale: 0, rotate: s.rotation, opacity: 1 }}
          animate={{
            x: s.dx,
            y: s.dy,
            scale: [0, 1, 0],
            rotate: s.rotation + 180,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: s.kind === "burst" ? BURST_DURATION : TRAIL_DURATION,
            ease: EASE_OUT_CUBIC,
            scale: {
              duration: s.kind === "burst" ? BURST_DURATION : TRAIL_DURATION,
              times: [0, 0.25, 1],
              ease: "easeOut",
            },
          }}
        >
          <path
            d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
            fill="currentColor"
          />
        </motion.svg>
      ))}
    </motion.button>
  );
}
