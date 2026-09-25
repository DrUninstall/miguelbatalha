"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Phone, PhoneOff, Timer, Music } from "lucide-react";
import styles from "./morphing-pill.module.css";

type PillState = "idle" | "call" | "timer" | "music";

const states: { id: PillState; label: string }[] = [
  { id: "idle", label: "Idle" },
  { id: "call", label: "Call" },
  { id: "timer", label: "Timer" },
  { id: "music", label: "Music" },
];

// The pill is dark in both themes, so icons use the light-on-dark tints.
const pillContent: Record<
  Exclude<PillState, "idle">,
  { icon: React.ReactNode; label: string; color: string }
> = {
  call: { icon: <Phone size={16} />, label: "John Appleseed", color: "rgb(var(--green-dark-800))" },
  timer: { icon: <Timer size={16} />, label: "0:42", color: "rgb(var(--amber-light-1000))" },
  music: { icon: <Music size={16} />, label: "Now Playing", color: "rgb(var(--brand-dark-1000))" },
};

/**
 * Size morph: stiffness 500, damping 35, mass 1
 * → damping ratio 35 / (2·√500) ≈ 0.78 (a barely-visible overshoot).
 */
const LAYOUT_SPRING = { type: "spring" as const, stiffness: 500, damping: 35, mass: 1 };

/** Equaliser bars: deterministic peaks (scaleY) and loop durations per bar. */
const BARS = [
  { peak: 1, duration: 0.6, rest: 0.5 },
  { peak: 0.7, duration: 0.75, rest: 0.9 },
  { peak: 0.9, duration: 0.55, rest: 0.65 },
  { peak: 0.6, duration: 0.7, rest: 0.8 },
];
const BAR_MIN = 0.2;

function MusicBars() {
  const reduceMotion = useReducedMotion();
  return (
    <div className={styles.musicBars} aria-hidden="true">
      {BARS.map((bar, i) =>
        reduceMotion ? (
          // Static, varied heights: still reads as an equaliser.
          <div key={i} className={styles.musicBar} style={{ transform: `scaleY(${bar.rest})` }} />
        ) : (
          <motion.div
            key={i}
            className={styles.musicBar}
            initial={{ scaleY: BAR_MIN }}
            animate={{ scaleY: [BAR_MIN, bar.peak, BAR_MIN] }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        )
      )}
    </div>
  );
}

export function MorphingPill() {
  const [state, setState] = useState<PillState>("idle");
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.container}>
      {/* The pill */}
      <div className={styles.pillWrapper}>
        <motion.div
          className={styles.pill}
          layout
          transition={LAYOUT_SPRING}
          style={{ borderRadius: 50 }}
        >
          <motion.div className={styles.pillInner} layout transition={LAYOUT_SPRING}>
            {/* popLayout: the outgoing content is taken out of flow immediately, so the
                pill measures and springs to the incoming content's size while the two
                crossfade. Every state, including idle, enters and exits the same way. */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={state}
                className={styles.content}
                initial={reduceMotion ? false : { opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? undefined : { opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
              >
                {state === "idle" ? (
                  <div className={styles.idleDot} aria-hidden="true" />
                ) : (
                  <div className={styles.expandedContent}>
                    <div
                      className={styles.contentIcon}
                      style={{ color: pillContent[state].color }}
                    >
                      {pillContent[state].icon}
                    </div>
                    <span className={styles.contentLabel}>{pillContent[state].label}</span>
                    {state === "call" && (
                      <div className={styles.callActions}>
                        <button
                          type="button"
                          className={`${styles.callButton} ${styles.accept}`}
                          onClick={() => setState("idle")}
                          aria-label="Accept call"
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.callButton} ${styles.decline}`}
                          onClick={() => setState("idle")}
                          aria-label="Decline call"
                        >
                          <PhoneOff size={14} />
                        </button>
                      </div>
                    )}
                    {state === "music" && <MusicBars />}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className={styles.controls} role="group" aria-label="Pill state">
        {states.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.controlButton} ${state === s.id ? styles.active : ""}`}
            onClick={() => setState(s.id)}
            aria-pressed={state === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
