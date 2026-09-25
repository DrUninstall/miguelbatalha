"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";
import { Phone, PhoneOff, Timer, Music } from "lucide-react";
import styles from "./morphing-pill.module.css";

/** "incoming" rings with Accept/Decline; "inCall" is an accepted call. */
type PillState = "idle" | "incoming" | "inCall" | "timer" | "music";

/** The demo's controls. Both call states count as "Call". */
const controls: { state: PillState; label: string }[] = [
  { state: "idle", label: "Idle" },
  { state: "incoming", label: "Call" },
  { state: "timer", label: "Timer" },
  { state: "music", label: "Music" },
];

// The pill is dark in both themes, so icons use the light-on-dark tints.
const CALL_GREEN = "rgb(var(--green-dark-800))";

/**
 * Size morph: stiffness 500, damping 35, mass 1
 * → damping ratio 35 / (2·√500) ≈ 0.78 (a barely-visible overshoot).
 */
const LAYOUT_SPRING = { type: "spring", stiffness: 500, damping: 35, mass: 1 } satisfies Transition;

/**
 * Equaliser bars: deterministic peaks (scaleY), loop durations and delays per
 * bar. The loop is a CSS @keyframes animation (see .musicBarAnimated), so the
 * blog's Pause toggle and reduced-motion rule can stop it.
 */
const BARS = [
  { peak: 1, duration: 0.6, rest: 0.5 },
  { peak: 0.7, duration: 0.75, rest: 0.9 },
  { peak: 0.9, duration: 0.55, rest: 0.65 },
  { peak: 0.6, duration: 0.7, rest: 0.8 },
];

function MusicBars() {
  const reduceMotion = useReducedMotion();
  return (
    <div className={styles.musicBars} aria-hidden="true">
      {BARS.map((bar, i) =>
        reduceMotion ? (
          // Static, varied heights: still reads as an equaliser.
          <div key={i} className={styles.musicBar} style={{ transform: `scaleY(${bar.rest})` }} />
        ) : (
          <div
            key={i}
            className={`${styles.musicBar} ${styles.musicBarAnimated}`}
            style={
              {
                "--peak": bar.peak,
                animationDuration: `${bar.duration}s`,
                animationDelay: `${i * 0.1}s`,
              }
            }
          />
        )
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Seconds since the call was accepted, counted from mount. */
function CallDuration() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className={`${styles.contentLabel} ${styles.duration}`}>{formatDuration(seconds)}</span>;
}

function PillIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={styles.contentIcon} style={{ color }}>
      {children}
    </div>
  );
}

export function MorphingPill() {
  const [state, setState] = useState<PillState>("idle");
  const reduceMotion = useReducedMotion();
  const idleButtonRef = useRef<HTMLButtonElement>(null);
  const endButtonRef = useRef<HTMLButtonElement>(null);

  // Each call button unmounts the button that had focus. Commit the new state
  // first so the control that takes focus exists.
  const accept = () => {
    flushSync(() => setState("inCall"));
    endButtonRef.current?.focus();
  };
  const hangUp = () => {
    setState("idle");
    idleButtonRef.current?.focus();
  };

  const renderContent = () => {
    switch (state) {
      case "idle":
        return <div className={styles.idleDot} aria-hidden="true" />;
      case "incoming":
        return (
          <div className={styles.expandedContent}>
            <PillIcon color={CALL_GREEN}>
              <Phone size={16} />
            </PillIcon>
            <span className={styles.contentLabel}>Incoming call</span>
            <div className={styles.callActions}>
              <button
                type="button"
                className={`${styles.callButton} ${styles.accept}`}
                onClick={accept}
                aria-label="Accept call"
              >
                <Phone size={14} />
              </button>
              <button
                type="button"
                className={`${styles.callButton} ${styles.decline}`}
                onClick={hangUp}
                aria-label="Decline call"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </div>
        );
      case "inCall":
        return (
          <div className={styles.expandedContent}>
            <PillIcon color={CALL_GREEN}>
              <Phone size={16} />
            </PillIcon>
            <CallDuration />
            <div className={styles.callActions}>
              <button
                ref={endButtonRef}
                type="button"
                className={`${styles.callButton} ${styles.decline}`}
                onClick={hangUp}
                aria-label="End call"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </div>
        );
      case "timer":
        return (
          <div className={styles.expandedContent}>
            <PillIcon color="rgb(var(--amber-light-1000))">
              <Timer size={16} />
            </PillIcon>
            <span className={styles.contentLabel}>0:42</span>
          </div>
        );
      case "music":
        return (
          <div className={styles.expandedContent}>
            <PillIcon color="rgb(var(--brand-dark-1000))">
              <Music size={16} />
            </PillIcon>
            <span className={styles.contentLabel}>Now playing</span>
            <MusicBars />
          </div>
        );
    }
  };

  const isCall = state === "incoming" || state === "inCall";

  return (
    <div className={styles.container}>
      <div className={styles.pillWrapper}>
        <motion.div
          className={styles.pill}
          layout
          transition={LAYOUT_SPRING}
          // Keep the radius here, in px: Framer only corrects the corners of a
          // layout animation for a radius it sets itself. From the CSS, the
          // corners would stretch with the pill's scale mid-morph.
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
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      <div className={styles.controls} role="group" aria-label="Pill state">
        {controls.map((control) => {
          const pressed = control.state === "incoming" ? isCall : state === control.state;
          return (
            <button
              key={control.state}
              ref={control.state === "idle" ? idleButtonRef : undefined}
              type="button"
              className={`${styles.controlButton} ${pressed ? styles.active : ""}`}
              onClick={() => setState(control.state)}
              aria-pressed={pressed}
            >
              {control.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
