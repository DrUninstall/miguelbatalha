"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import styles from "./animated-icons.module.css";

export function AnimatedHeart({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Heart size={size} className={`${styles.iconWrapper} ${styles.heart}`} />
    </motion.div>
  );
}

export function AnimatedStar({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      whileHover={{ rotate: 72 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Star size={size} className={`${styles.iconWrapper} ${styles.star}`} />
    </motion.div>
  );
}

export function AnimatedSpinner({ size = 24 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 size={size} className={styles.spinner} />
    </motion.div>
  );
}

export function PulsingDot({ size = 12 }: { size?: number }) {
  return (
    <div className={styles.pulsingDotContainer}>
      <motion.div
        className={styles.pulsingDotOuter}
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div
        className={styles.pulsingDotInner}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// Reusable animated icon switch with blur/scale/opacity transition
// Perfect for contextual icon changes like copy/check, play/pause, etc.
export function AnimatedIconSwitch({
  iconKey,
  children,
  className,
}: {
  iconKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={iconKey}
        initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
        transition={{
          type: "spring",
          duration: 0.3,
          bounce: 0,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Example Icon Buttons with State Transitions
// ============================================

// Copy button with check confirmation
export function CopyButton({
  size = 20,
  onCopy,
}: {
  size?: number;
  onCopy?: () => void;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    onCopy?.();
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={styles.iconButton}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isCopied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          {isCopied ? (
            <Check size={size} className={styles.checkIcon} />
          ) : (
            <Copy size={size} className={styles.defaultIcon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Play/Pause toggle
export function PlayPauseButton({
  size = 20,
  isPlaying,
  onToggle,
}: {
  size?: number;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={styles.iconButton}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isPlaying ? "pause" : "play"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          {isPlaying ? (
            <Pause size={size} className={styles.defaultIcon} />
          ) : (
            <Play size={size} className={styles.defaultIcon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Mute/Unmute toggle
export function MuteButton({
  size = 20,
  isMuted,
  onToggle,
}: {
  size?: number;
  isMuted: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={styles.iconButton}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isMuted ? "muted" : "unmuted"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          {isMuted ? (
            <VolumeX size={size} className={styles.defaultIcon} />
          ) : (
            <Volume2 size={size} className={styles.defaultIcon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Password visibility toggle
export function VisibilityToggle({
  size = 20,
  isVisible,
  onToggle,
}: {
  size?: number;
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={styles.iconButton} type="button">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isVisible ? "visible" : "hidden"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          {isVisible ? (
            <EyeOff size={size} className={styles.defaultIcon} />
          ) : (
            <Eye size={size} className={styles.defaultIcon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Expandable chevron (rotates smoothly)
export function ExpandChevron({
  size = 20,
  isExpanded,
}: {
  size?: number;
  isExpanded: boolean;
}) {
  return (
    <motion.div
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{
        type: "spring",
        duration: 0.3,
        bounce: 0,
      }}
      className={styles.iconSwitchWrapper}
    >
      <ChevronDown size={size} className={styles.defaultIcon} />
    </motion.div>
  );
}

// Submit button with success state (Send → Check)
export function SubmitButton({
  size = 20,
  isSubmitted,
  onSubmit,
  disabled,
}: {
  size?: number;
  isSubmitted: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onSubmit}
      className={styles.iconButton}
      disabled={disabled || isSubmitted}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isSubmitted ? "success" : "send"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          {isSubmitted ? (
            <CheckCircle size={size} className={styles.checkIcon} />
          ) : (
            <Send size={size} className={styles.defaultIcon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Like button with "pop" animation on toggle
export function LikeButton({
  size = 20,
  isLiked,
  onToggle,
}: {
  size?: number;
  isLiked: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={styles.iconButton}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isLiked ? "liked" : "unliked"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.75, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconSwitchWrapper}
        >
          <Heart
            size={size}
            className={isLiked ? styles.likedHeart : styles.defaultIcon}
            fill={isLiked ? "currentColor" : "none"}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

// Download button with animated arrow (CSS only, no Framer Motion)
export function DownloadButton() {
  const ArrowDown = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18.25 14L12 20.25L5.75 14M12 19.5V3.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <button aria-label="Download" className={styles.downloadButton}>
      {ArrowDown}
      {ArrowDown}
    </button>
  );
}
