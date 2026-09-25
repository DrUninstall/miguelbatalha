"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import styles from "./text-reveal.module.css";

interface TextRevealProps {
  text?: string;
}

export function TextReveal({ text = "Animations" }: TextRevealProps) {
  const [replays, setReplays] = useState(0);

  return (
    <div className={styles.container}>
      {/* Changing the key remounts the paragraph, which restarts every CSS animation in it. */}
      <p key={replays} className={styles.text}>
        {/* Screen readers get the word once; the per-letter spans are hidden from them. */}
        <span className={styles.srOnly}>{text}</span>
        <span className={styles.letters} aria-hidden="true">
          {Array.from(text).map((char, index) => (
            <span
              key={index}
              className={styles.letter}
              style={{ "--index": index } as React.CSSProperties}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </span>
      </p>
      <button
        type="button"
        className={styles.button}
        onClick={() => setReplays((n) => n + 1)}
      >
        <RotateCcw size={14} aria-hidden="true" />
        Replay
      </button>
    </div>
  );
}
