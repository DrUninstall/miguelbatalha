"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./marquee.module.css";

interface MarqueeProps {
  items?: string[];
  /** Seconds per item for one full loop (loop duration = items.length * speed / 10). */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

const defaultItems = [
  "React",
  "TypeScript",
  "Next.js",
  "Framer Motion",
  "Figma",
  "Node.js",
  "CSS",
  "Unreal Engine",
  "Product Strategy",
  "UI/UX Design",
];

export function Marquee({
  items = defaultItems,
  speed = 30,
  direction = "left",
  pauseOnHover = true,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const duration = (items.length * speed) / 10;

  const className = [
    styles.root,
    pauseOnHover ? styles.pauseOnHover : "",
    paused ? styles.paused : "",
  ].join(" ");

  return (
    <div className={className}>
      <div className={styles.viewport}>
        {/* One track holding the list twice; translating it by -50% moves
            exactly one copy's width, so the second copy lands where the
            first started and the loop is seamless. */}
        <div
          className={styles.track}
          style={{
            animationDuration: `${duration}s`,
            animationDirection: direction === "right" ? "reverse" : "normal",
          }}
        >
          <ul className={styles.group}>
            {items.map((item, i) => (
              <li key={i} className={styles.item}>
                {item}
              </li>
            ))}
          </ul>
          <ul className={`${styles.group} ${styles.duplicate}`} aria-hidden>
            {items.map((item, i) => (
              <li key={i} className={styles.item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={paused}
        aria-label="Pause marquee"
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
      </button>
    </div>
  );
}
