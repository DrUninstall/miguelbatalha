"use client";

import { useTheme } from "next-themes";
import { useId, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./theme-toggle.module.css";

// Switch theme inside a View Transition; app/globals.css grows the new theme
// as a circle (clip-path) from --transition-x/--transition-y.
function toggleThemeWithTransition(
  event: React.MouseEvent<HTMLElement>,
  newTheme: "light" | "dark",
  setTheme: (theme: string) => void
) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    setTheme(newTheme);
    return;
  }

  // Circle origin: the pointer position, or the button's centre when the
  // click came from the keyboard (Enter/Space report detail 0 and 0,0 coords).
  let x = event.clientX;
  let y = event.clientY;
  if (event.detail === 0) {
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  // Radius that reaches the farthest viewport corner
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const root = document.documentElement;
  root.style.setProperty("--transition-x", `${x}px`);
  root.style.setProperty("--transition-y", `${y}px`);
  root.style.setProperty("--transition-r", `${endRadius}px`);

  // flushSync so next-themes has applied the new class before the browser
  // captures the "new" snapshot.
  document.startViewTransition(() => {
    flushSync(() => setTheme(newTheme));
  });
}

// The theme is unknown during prerender, so render a placeholder until hydrated.
const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function ThemeToggle() {
  const mounted = useIsClient();
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <span className={styles.skeleton} aria-hidden="true" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => toggleThemeWithTransition(e, isDark ? "light" : "dark", setTheme)}
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
            <Moon className={styles.icon} aria-hidden="true" />
          ) : (
            <Sun className={styles.icon} aria-hidden="true" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeToggleExpanded() {
  const mounted = useIsClient();
  const { resolvedTheme: theme, setTheme } = useTheme();
  // Unique per instance so two toggles on one page don't share a highlight
  const highlightId = `theme-highlight-${useId()}`;

  if (!mounted) {
    return (
      <div className={styles.skeletonExpanded}>
        <div className={styles.skeletonButton}>Light</div>
        <div className={styles.skeletonButton}>Dark</div>
      </div>
    );
  }

  return (
    <div className={styles.expandedToggle} role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={(e) => !active && toggleThemeWithTransition(e, value, setTheme)}
            aria-pressed={active}
            className={`${styles.toggleButton} ${active ? styles.active : styles.inactive}`}
          >
            {/* The highlight lives inside the active button; layoutId animates it
                between buttons with a transform, so it matches unequal widths. */}
            {active && (
              <motion.span
                layoutId={highlightId}
                className={styles.highlight}
                style={{ borderRadius: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={styles.toggleIcon} aria-hidden="true" />
            <span className={styles.toggleLabel}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
