"use client";

import styles from "./marquee.module.css";

interface MarqueeProps {
  items?: string[];
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
  const duration = items.length * speed / 10;

  return (
    <div
      className={`${styles.marquee} ${pauseOnHover ? styles.pauseOnHover : ""}`}
    >
      <div
        className={styles.track}
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
          </span>
        ))}
      </div>
      <div
        className={styles.track}
        aria-hidden
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
