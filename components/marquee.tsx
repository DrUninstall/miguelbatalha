"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./marquee.module.css";

interface MarqueeProps {
  items?: string[];
  /** Scroll speed. The loop's duration is derived from the measured width. */
  pxPerSecond?: number;
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
  "Product strategy",
  "UI/UX design",
];

export function Marquee({
  items = defaultItems,
  pxPerSecond = 40,
  direction = "left",
  pauseOnHover = true,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  // How many times the list repeats in each half of the track. One is enough
  // unless a single list is narrower than the strip.
  const [copiesPerHalf, setCopiesPerHalf] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const list = listRef.current;
    if (!viewport || !track || !list) return;
    const measure = () => {
      const listWidth = list.getBoundingClientRect().width;
      if (listWidth === 0) return;
      const copies = Math.max(1, Math.ceil(viewport.clientWidth / listWidth));
      setCopiesPerHalf(copies);
      // The track moves by half its width, one half being `copies` lists.
      track.style.setProperty("--duration", `${(copies * listWidth) / pxPerSecond}s`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(list);
    return () => observer.disconnect();
  }, [pxPerSecond]);

  const className = [
    styles.root,
    pauseOnHover ? styles.pauseOnHover : "",
    paused ? styles.paused : "",
  ].join(" ");

  return (
    <div className={className}>
      <div ref={viewportRef} className={styles.viewport}>
        {/* The track holds two identical halves; translating it by -50% moves
            exactly one half, so the second lands where the first started and
            the loop is seamless. That only holds while a half is at least as
            wide as the strip, which copiesPerHalf ensures. */}
        <div
          ref={trackRef}
          className={styles.track}
          style={{ animationDirection: direction === "right" ? "reverse" : "normal" }}
        >
          {Array.from({ length: copiesPerHalf * 2 }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === 0 ? listRef : undefined}
              className={copy === 0 ? styles.group : `${styles.group} ${styles.duplicate}`}
              aria-hidden={copy === 0 ? undefined : true}
            >
              {items.map((item, i) => (
                <li key={i} className={styles.item}>
                  {item}
                </li>
              ))}
            </ul>
          ))}
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
