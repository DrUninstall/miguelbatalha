"use client";

import { useState } from "react";
import styles from "./text-reveal.module.css";

interface TextRevealProps {
  text?: string;
}

export function TextReveal({ text = "Animations" }: TextRevealProps) {
  const [reset, setReset] = useState(0);

  return (
    <div className={styles.container}>
      <div key={reset}>
        <h1 className={styles.h1}>
          {text.split("").map((char, index) => (
            <span
              key={index}
              style={{ "--index": index } as React.CSSProperties}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
      <button className={styles.button} onClick={() => setReset(reset + 1)}>
        Replay animation
      </button>
    </div>
  );
}
