"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Heart,
  Star,
  Loader2,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ChevronDown,
  Send,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";
import styles from "./animated-icons.module.css";

// Clears a pending timeout on unmount; start() replaces any pending one.
function useTimeout() {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (ref.current) clearTimeout(ref.current);
  }, []);
  return {
    start(fn: () => void, ms: number) {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(fn, ms);
    },
    clear() {
      if (ref.current) clearTimeout(ref.current);
      ref.current = null;
    },
  };
}

// ============================================
// Expressive icons
// ============================================

// Fills with a spring "pop": scale 0.6 → 1, underdamped so it overshoots (~1.13)
const HEART_POP = { type: "spring", stiffness: 500, damping: 15 } as const;

export function AnimatedHeart({
  size = 24,
  label = "Favorite",
}: {
  size?: number;
  label?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={pressed}
      onClick={() => setPressed((p) => !p)}
    >
      <motion.span
        className={styles.iconSwitchWrapper}
        initial={false}
        animate={{ scale: pressed ? [0.6, 1] : 1 }}
        transition={HEART_POP}
      >
        <Heart
          size={size}
          className={styles.heart}
          fill="currentColor"
          fillOpacity={pressed ? 1 : 0}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}

// Fills with a one-point twirl: jumps to -72° (a five-point star looks identical
// there) and springs back to 0°, overshooting slightly.
const STAR_TWIRL = { type: "spring", stiffness: 300, damping: 15 } as const;

export function AnimatedStar({
  size = 24,
  label = "Star",
}: {
  size?: number;
  label?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={pressed}
      onClick={() => setPressed((p) => !p)}
    >
      <motion.span
        className={styles.iconSwitchWrapper}
        initial={false}
        animate={{ rotate: pressed ? [-72, 0] : 0 }}
        transition={STAR_TWIRL}
      >
        <Star
          size={size}
          className={styles.star}
          fill="currentColor"
          fillOpacity={pressed ? 1 : 0}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}

// Linear rotation is right for an indeterminate spinner: constant speed = "still working".
export function AnimatedSpinner({ size = 24 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <span role="status" aria-label="Loading" className={styles.spinnerWrapper}>
      {reduceMotion ? (
        // Static partial ring: same shape, no motion
        <Loader2 size={size} className={styles.spinner} aria-hidden="true" />
      ) : (
        // CSS @keyframes (1s linear, infinite) so a paused demo or an
        // off-screen page stops it without any JS
        <span className={`${styles.iconSwitchWrapper} ${styles.spin}`}>
          <Loader2 size={size} className={styles.spinner} aria-hidden="true" />
        </span>
      )}
      <span className={styles.srOnly}>Loading</span>
    </span>
  );
}

export function PulsingDot({
  size = 12,
  label = "Online",
}: {
  size?: number;
  label?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      role="img"
      aria-label={label}
      className={styles.pulsingDotContainer}
      style={{ width: size, height: size }}
    >
      {!reduceMotion && (
        // A ring that grows out of the dot and fades, restarting every 1.6s
        // (CSS @keyframes: scale 1 → 2.5, opacity 0.6 → 0, ease-out)
        <span className={styles.pulsingDotOuter} />
      )}
      <span className={styles.pulsingDotInner} />
    </span>
  );
}

// ============================================
// Shared icon crossfade
// ============================================

// Reusable animated icon switch: the outgoing icon shrinks and blurs out while
// the incoming one grows from 0.25 and sharpens. Under reduced motion it's a
// plain opacity crossfade (no scale, no blur).
export function AnimatedIconSwitch({
  iconKey,
  children,
}: {
  iconKey: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.25, filter: "blur(4px)" };
  const exit = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.75, filter: "blur(4px)" };
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={iconKey}
        initial={hidden}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={exit}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        className={styles.iconSwitchWrapper}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

// ============================================
// State toggle icons (aria-pressed, static labels)
// ============================================

export function LikeButton({
  size = 20,
  isLiked,
  onToggle,
  label = "Like",
}: {
  size?: number;
  isLiked: boolean;
  onToggle: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={isLiked}
    >
      <AnimatedIconSwitch iconKey={isLiked ? "liked" : "unliked"}>
        <ThumbsUp
          size={size}
          className={isLiked ? styles.liked : styles.defaultIcon}
          fill={isLiked ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </AnimatedIconSwitch>
    </button>
  );
}

export function PlayPauseButton({
  size = 20,
  isPlaying,
  onToggle,
  label = "Play",
}: {
  size?: number;
  isPlaying: boolean;
  onToggle: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={isPlaying}
    >
      <AnimatedIconSwitch iconKey={isPlaying ? "pause" : "play"}>
        {isPlaying ? (
          <Pause size={size} className={styles.defaultIcon} aria-hidden="true" />
        ) : (
          <Play size={size} className={styles.defaultIcon} aria-hidden="true" />
        )}
      </AnimatedIconSwitch>
    </button>
  );
}

export function MuteButton({
  size = 20,
  isMuted,
  onToggle,
  label = "Mute",
}: {
  size?: number;
  isMuted: boolean;
  onToggle: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={isMuted}
    >
      <AnimatedIconSwitch iconKey={isMuted ? "muted" : "unmuted"}>
        {isMuted ? (
          <VolumeX size={size} className={styles.defaultIcon} aria-hidden="true" />
        ) : (
          <Volume2 size={size} className={styles.defaultIcon} aria-hidden="true" />
        )}
      </AnimatedIconSwitch>
    </button>
  );
}

export function VisibilityToggle({
  size = 20,
  isVisible,
  onToggle,
  label = "Show password",
}: {
  size?: number;
  isVisible: boolean;
  onToggle: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.iconButton}
      aria-label={label}
      aria-pressed={isVisible}
    >
      <AnimatedIconSwitch iconKey={isVisible ? "visible" : "hidden"}>
        {isVisible ? (
          <EyeOff size={size} className={styles.defaultIcon} aria-hidden="true" />
        ) : (
          <Eye size={size} className={styles.defaultIcon} aria-hidden="true" />
        )}
      </AnimatedIconSwitch>
    </button>
  );
}

// Chevron that rotates 0° ↔ 180°. Bare icon: wrap it in your own control, or use ExpandButton.
export function ExpandChevron({
  size = 20,
  isExpanded,
}: {
  size?: number;
  isExpanded: boolean;
}) {
  return (
    <motion.span
      initial={false}
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      className={styles.iconSwitchWrapper}
    >
      <ChevronDown size={size} className={styles.defaultIcon} aria-hidden="true" />
    </motion.span>
  );
}

export function ExpandButton({
  size = 20,
  isExpanded,
  onToggle,
  label = "Show details",
  controls,
}: {
  size?: number;
  isExpanded: boolean;
  onToggle: () => void;
  label?: string;
  /** id of the region this button shows/hides */
  controls?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.iconButton}
      aria-label={label}
      aria-expanded={isExpanded}
      aria-controls={controls}
    >
      <ExpandChevron size={size} isExpanded={isExpanded} />
    </button>
  );
}

// ============================================
// Action icons (animate once to confirm)
// ============================================

export function CopyButton({
  size = 20,
  text = "Copied from the animated icons demo",
  onCopy,
  label = "Copy",
}: {
  size?: number;
  /** What gets written to the clipboard */
  text?: string;
  onCopy?: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const reset = useTimeout();

  const handleCopy = async () => {
    reset.clear();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setIsCopied(false);
      setAnnouncement("Copy failed");
      reset.start(() => setAnnouncement(""), 2000);
      return;
    }
    setIsCopied(true);
    setAnnouncement("Copied");
    onCopy?.();
    reset.start(() => {
      setIsCopied(false);
      setAnnouncement("");
    }, 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={styles.iconButton}
        aria-label={label}
      >
        <AnimatedIconSwitch iconKey={isCopied ? "check" : "copy"}>
          {isCopied ? (
            <Check size={size} className={styles.checkIcon} aria-hidden="true" />
          ) : (
            <Copy size={size} className={styles.defaultIcon} aria-hidden="true" />
          )}
        </AnimatedIconSwitch>
      </button>
      <span className={styles.srOnly} aria-live="polite">
        {announcement}
      </span>
    </>
  );
}

const SUBMIT_LOADING_MS = 800;
const SUBMIT_SUCCESS_MS = 1500;

// Send → spinner (800ms) → check (1500ms) → Send. Stays focusable while busy:
// aria-disabled instead of disabled (which would drop keyboard focus).
export function SubmitButton({
  size = 20,
  onSubmit,
  label = "Send",
}: {
  size?: number;
  onSubmit?: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const reduceMotion = useReducedMotion();
  const timer = useTimeout();
  const busy = phase !== "idle";

  const handleClick = () => {
    if (busy) return;
    onSubmit?.();
    setPhase("loading");
    timer.start(() => {
      setPhase("success");
      timer.start(() => setPhase("idle"), SUBMIT_SUCCESS_MS);
    }, SUBMIT_LOADING_MS);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={styles.iconButton}
        aria-label={label}
        aria-disabled={busy}
      >
        <AnimatedIconSwitch iconKey={phase}>
          {phase === "success" ? (
            <CheckCircle size={size} className={styles.checkIcon} aria-hidden="true" />
          ) : phase === "loading" ? (
            <span className={`${styles.iconSwitchWrapper} ${reduceMotion ? "" : styles.spin}`}>
              <Loader2 size={size} className={styles.defaultIcon} aria-hidden="true" />
            </span>
          ) : (
            <Send size={size} className={styles.defaultIcon} aria-hidden="true" />
          )}
        </AnimatedIconSwitch>
      </button>
      <span className={styles.srOnly} aria-live="polite">
        {phase === "loading" ? "Sending" : phase === "success" ? "Sent" : ""}
      </span>
    </>
  );
}

const DOWNLOAD_DROP_MS = 300; // matches the arrow's drop transition in CSS
const DOWNLOAD_DONE_MS = 2000;

// Arrow drops into the tray (clipped at the tray floor), a check draws in,
// then after 2s the arrow slides back in from the top. CSS transitions driven
// by data-state; no framer-motion.
export function DownloadButton({
  onDownload,
  label = "Download",
}: {
  onDownload?: () => void;
  /** Accessible name; keep it equal to any visible caption */
  label?: string;
} = {}) {
  const [state, setState] = useState<"idle" | "dropping" | "done">("idle");
  const timer = useTimeout();

  const handleClick = () => {
    if (state !== "idle") return;
    onDownload?.();
    setState("dropping");
    timer.start(() => {
      setState("done");
      timer.start(() => setState("idle"), DOWNLOAD_DONE_MS);
    }, DOWNLOAD_DROP_MS);
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-disabled={state !== "idle"}
        className={styles.downloadButton}
        data-state={state}
        onClick={handleClick}
      >
        <span className={styles.downloadIcon} aria-hidden="true">
          <span className={styles.arrowClip}>
            <svg className={styles.arrow} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v10M8 10.5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <svg className={styles.tray} width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 14.5v3.75a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V14.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={styles.check}
              d="M8.75 9.25l2.25 2.25 4.25-4.5"
              pathLength={1}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <span className={styles.srOnly} aria-live="polite">
        {state === "done" ? "Downloaded" : ""}
      </span>
    </>
  );
}
