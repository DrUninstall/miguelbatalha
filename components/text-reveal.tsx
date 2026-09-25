"use client";

import { Fragment, useState } from "react";
import { RotateCcw } from "lucide-react";
import styles from "./text-reveal.module.css";

interface TextRevealProps {
  text?: string;
}

export function TextReveal({ text = "Animations" }: TextRevealProps) {
  const [replays, setReplays] = useState(0);

  return (
    <div className={styles.container}>
      {/* Changing the key remounts the reveal, which restarts every CSS animation in it. */}
      <Reveal key={replays} text={text} />
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

/** Splits text into words, numbering letters across the whole line (spaces don't count). */
function splitWords(text: string) {
  let offset = 0;
  return text.split(" ").map((word) => {
    const letters = Array.from(word);
    const start = offset;
    offset += letters.length;
    return { letters, start };
  });
}

function Reveal({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);
  const words = splitWords(text);
  const lastIndex = words.reduce((n, word) => n + word.letters.length, 0) - 1;

  return (
    <p className={styles.text}>
      {/* Letters in separate inline-blocks lose kerning, so once the last one lands
          they are swapped for the plain text. */}
      {!revealed && (
        <span className={styles.letters} aria-hidden="true">
          {words.map(({ letters, start }, w) => (
            <Fragment key={w}>
              {w > 0 && " "}
              <span className={styles.word}>
                {letters.map((char, i) => (
                  <span
                    key={i}
                    className={styles.letter}
                    style={{ "--index": start + i }}
                    onAnimationEnd={
                      start + i === lastIndex ? () => setRevealed(true) : undefined
                    }
                  >
                    {char}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      )}
      <span className={styles.label}>{text}</span>
    </p>
  );
}
