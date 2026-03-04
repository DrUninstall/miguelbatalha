"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mic, PhoneOff, Timer, Music } from "lucide-react";
import styles from "./morphing-pill.module.css";

type PillState = "idle" | "call" | "timer" | "music";

const pillContent: Record<PillState, { icon: React.ReactNode; label: string; color: string }> = {
  idle: { icon: null, label: "", color: "" },
  call: { icon: <Phone size={16} />, label: "John Appleseed", color: "var(--green-light-1000)" },
  timer: { icon: <Timer size={16} />, label: "0:42", color: "var(--amber-light-1000)" },
  music: { icon: <Music size={16} />, label: "Now Playing", color: "var(--brand-light-1000)" },
};

export function MorphingPill() {
  const [state, setState] = useState<PillState>("idle");

  return (
    <div className={styles.container}>
      {/* The pill */}
      <div className={styles.pillWrapper}>
        <motion.div
          className={styles.pill}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          style={{
            borderRadius: 50,
          }}
        >
          <motion.div className={styles.pillInner} layout>
            {state === "idle" ? (
              <motion.div
                className={styles.idleDot}
                layoutId="pill-indicator"
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  className={styles.expandedContent}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={styles.contentIcon}
                    style={{ color: `rgb(${pillContent[state].color})` }}
                  >
                    {pillContent[state].icon}
                  </div>
                  <span className={styles.contentLabel}>
                    {pillContent[state].label}
                  </span>
                  {state === "call" && (
                    <div className={styles.callActions}>
                      <button
                        className={styles.callButton}
                        style={{ background: "rgb(var(--green-light-1000))" }}
                        onClick={() => setState("idle")}
                        aria-label="Accept call"
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className={styles.callButton}
                        style={{ background: "rgb(var(--red-light-1000))" }}
                        onClick={() => setState("idle")}
                        aria-label="Decline call"
                      >
                        <PhoneOff size={14} />
                      </button>
                    </div>
                  )}
                  {state === "music" && (
                    <div className={styles.musicBars}>
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className={styles.musicBar}
                          animate={{
                            height: [4, 12 + Math.random() * 8, 4],
                          }}
                          transition={{
                            duration: 0.5 + Math.random() * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${state === "idle" ? styles.active : ""}`}
          onClick={() => setState("idle")}
        >
          Idle
        </button>
        <button
          className={`${styles.controlButton} ${state === "call" ? styles.active : ""}`}
          onClick={() => setState("call")}
        >
          Call
        </button>
        <button
          className={`${styles.controlButton} ${state === "timer" ? styles.active : ""}`}
          onClick={() => setState("timer")}
        >
          Timer
        </button>
        <button
          className={`${styles.controlButton} ${state === "music" ? styles.active : ""}`}
          onClick={() => setState("music")}
        >
          Music
        </button>
      </div>
    </div>
  );
}
