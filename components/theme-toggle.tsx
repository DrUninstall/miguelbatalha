"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import styles from "./theme-toggle.module.css";

// No framer-motion in this file: ThemeToggle lives in the site header on every
// page. Both icons are always rendered and the `.dark` class on <html> decides
// which one shows (see theme-toggle.module.css).

// next-themes runs with disableTransitionOnChange, which turns every CSS
// *transition* off for the frame the theme class changes. CSS *animations* are
// unaffected, so the icon swap and the highlight slide are keyframes. They're
// only switched on once the person has toggled the theme (data-theme-switched
// on <html>), so nothing animates on page load.
function markSwitched() {
  document.documentElement.setAttribute("data-theme-switched", "");
}

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
    markSwitched();
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
  // captures the "new" snapshot. markSwitched() goes inside the callback so the
  // "old" snapshot is taken before any icon animation starts.
  document.startViewTransition(() => {
    markSwitched();
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
    return <span className={styles.skeleton} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => toggleThemeWithTransition(e, isDark ? "light" : "dark", setTheme)}
      className={styles.themeToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className={`${styles.iconWrapper} ${styles.sun}`} aria-hidden="true">
        <Sun className={styles.icon} />
      </span>
      <span className={`${styles.iconWrapper} ${styles.moon}`} aria-hidden="true">
        <Moon className={styles.icon} />
      </span>
    </button>
  );
}

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

const OPTION_CLASS = { light: styles.optionLight, dark: styles.optionDark };

// Two equal-width options with one highlight that slides between them. The
// highlight's position and the option colours come from the `.dark` class
// (set before hydration by next-themes' script), so the placeholder below
// already looks exactly like the hydrated control: same size, same state.
export function ThemeToggleExpanded() {
  const mounted = useIsClient();
  const { resolvedTheme: theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div className={styles.expandedToggle} aria-hidden="true">
        <span className={styles.highlight} />
        {OPTIONS.map(({ value, label, Icon }) => (
          <span key={value} className={`${styles.toggleButton} ${OPTION_CLASS[value]}`}>
            <Icon className={styles.toggleIcon} />
            <span className={styles.toggleLabel}>{label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.expandedToggle} role="group" aria-label="Theme">
      <span className={styles.highlight} aria-hidden="true" />
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={(e) => !active && toggleThemeWithTransition(e, value, setTheme)}
            aria-pressed={active}
            className={`${styles.toggleButton} ${OPTION_CLASS[value]}`}
          >
            <Icon className={styles.toggleIcon} aria-hidden="true" />
            <span className={styles.toggleLabel}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
