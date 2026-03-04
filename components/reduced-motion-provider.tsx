"use client";

import { MotionConfig } from "framer-motion";

/**
 * Wraps the app in Framer Motion's MotionConfig with reducedMotion="user".
 * This makes all Framer Motion animations (springs, layout, AnimatePresence)
 * respect the OS-level prefers-reduced-motion setting.
 *
 * When the user has reduced motion enabled, animations complete instantly
 * (no duration, no spring) rather than being visually animated.
 */
export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
