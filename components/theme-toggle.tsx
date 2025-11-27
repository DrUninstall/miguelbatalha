"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./theme-toggle.module.css";

// Helper function to toggle theme with View Transitions API
function toggleThemeWithTransition(
  event: React.MouseEvent,
  isDark: boolean,
  setTheme: (theme: string) => void
) {
  const newTheme = isDark ? "light" : "dark";

  // Check if View Transitions API is supported
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    setTheme(newTheme);
    return;
  }

  // Get click position for the circle origin
  const x = event.clientX;
  const y = event.clientY;
  // Calculate the radius needed to cover the whole screen
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Set CSS custom properties for the animation
  document.documentElement.style.setProperty("--transition-x", `${x}px`);
  document.documentElement.style.setProperty("--transition-y", `${y}px`);
  document.documentElement.style.setProperty("--transition-r", `${endRadius}px`);

  // Start the view transition
  document.startViewTransition(() => {
    setTheme(newTheme);
  });
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.skeleton} aria-label="Toggle theme">
        <div className={styles.skeletonIcon} />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={(e) => toggleThemeWithTransition(e, isDark, setTheme)}
      className={styles.themeToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className={styles.iconWrapper}
        >
          {isDark ? (
            <Moon className={styles.icon} />
          ) : (
            <Sun className={styles.icon} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

export function ThemeToggleExpanded() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.skeletonExpanded}>
        <div className={styles.skeletonButton}>Light</div>
        <div className={styles.skeletonButton}>Dark</div>
      </div>
    );
  }

  return (
    <div className={styles.expandedToggle}>
      {/* Sliding background */}
      <motion.div
        className={styles.slidingBackground}
        initial={false}
        animate={{
          left: theme === "light" ? "4px" : "calc(50% + 0px)",
          width: "calc(50% - 8px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      <button
        onClick={(e) => toggleThemeWithTransition(e, theme === "dark", setTheme)}
        className={`${styles.toggleButton} ${
          theme === "light" ? styles.active : styles.inactive
        }`}
      >
        <Sun className={styles.toggleIcon} />
        <span>Light</span>
      </button>

      <button
        onClick={(e) => toggleThemeWithTransition(e, theme === "dark", setTheme)}
        className={`${styles.toggleButton} ${
          theme === "dark" ? styles.active : styles.inactive
        }`}
      >
        <Moon className={styles.toggleIcon} />
        <span>Dark</span>
      </button>
    </div>
  );
}
