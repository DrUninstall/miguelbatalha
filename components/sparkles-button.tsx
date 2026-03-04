"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./sparkles-button.module.css";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

const SPARKLE_COLORS = [
  "rgb(76, 100, 217)",
  "rgb(126, 71, 204)",
  "rgb(254, 198, 46)",
  "rgb(6, 122, 87)",
  "rgb(26, 116, 168)",
];

let sparkleId = 0;

function createSparkle(rect: DOMRect, e: React.MouseEvent): Sparkle {
  return {
    id: sparkleId++,
    x: e.clientX - rect.left + (Math.random() - 0.5) * 40,
    y: e.clientY - rect.top + (Math.random() - 0.5) * 40,
    size: Math.random() * 10 + 6,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    rotation: Math.random() * 360,
  };
}

export function SparklesButton({
  children = "Sparkle Me",
}: {
  children?: React.ReactNode;
}) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newSparkles = Array.from({ length: 12 }, () =>
      createSparkle(rect, e)
    );
    setSparkles((prev) => [...prev, ...newSparkles]);

    setTimeout(() => {
      setSparkles((prev) =>
        prev.filter((s) => !newSparkles.includes(s))
      );
    }, 800);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (Math.random() > 0.6) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const sparkle = createSparkle(rect, e);
    setSparkles((prev) => [...prev, sparkle]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 600);
  }, []);

  return (
    <motion.button
      ref={buttonRef}
      className={styles.button}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className={styles.label}>{children}</span>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.svg
            key={sparkle.id}
            className={styles.sparkle}
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
            }}
            viewBox="0 0 24 24"
            initial={{ scale: 0, rotate: sparkle.rotation, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              rotate: sparkle.rotation + 180,
              opacity: [1, 1, 0],
              y: [0, -20 - Math.random() * 30],
              x: [(Math.random() - 0.5) * 30],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <path
              d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
              fill={sparkle.color}
            />
          </motion.svg>
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
