"use client";

import { useTheme } from "next-themes";
import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Sun, Moon, Monitor } from "lucide-react";
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

type Point = { x: number; y: number };

function centreOf(el: Element): Point {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Where the circle starts: the pointer, or the control's centre when the click
// came from the keyboard (Enter/Space report detail 0 and 0,0 coordinates).
function revealOrigin(event: React.MouseEvent<HTMLElement>): Point {
  return event.detail === 0 ? centreOf(event.currentTarget) : { x: event.clientX, y: event.clientY };
}

// Switch theme inside a View Transition; app/globals.css grows the new theme
// as a circle (clip-path) from --transition-x/--transition-y.
function setThemeWithReveal(theme: string, origin: Point, setTheme: (theme: string) => void) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    markSwitched();
    setTheme(theme);
    return;
  }

  const { x, y } = origin;
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
    flushSync(() => setTheme(theme));
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
      onClick={(e) => setThemeWithReveal(isDark ? "light" : "dark", revealOrigin(e), setTheme)}
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
  { value: "system", label: "System", Icon: Monitor },
] as const;

type ThemeChoice = (typeof OPTIONS)[number]["value"];

const HIGHLIGHT_SLIDE = { duration: 300, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" };

// The highlight's resting position, one column (its own width + the 8px gap) per option.
const highlightX = (index: number) => `calc(${index} * (100% + 8px))`;

// A radio group: Light, Dark or System, one Tab stop, arrow keys move the
// choice. The highlight marks the choice, not the theme it resolves to, so
// System stays highlighted when the OS flips between light and dark.
export function ThemeToggleExpanded() {
  const mounted = useIsClient();
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const highlightRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!mounted) {
    return (
      <div className={styles.expandedToggle} aria-hidden="true">
        {OPTIONS.map(({ value, label, Icon }) => (
          <span key={value} className={styles.option}>
            <Icon className={styles.optionIcon} />
            <span>{label}</span>
          </span>
        ))}
      </div>
    );
  }

  const selectedIndex = Math.max(0, OPTIONS.findIndex((option) => option.value === theme));

  const choose = (index: number, origin: Point) => {
    if (index === selectedIndex) return;
    const next: ThemeChoice = OPTIONS[index].value;

    // next-themes turns CSS transitions off while it swaps the theme class, so
    // the slide is a Web Animation, which that doesn't touch.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      highlightRef.current?.animate(
        { translate: [highlightX(selectedIndex), highlightX(index)] },
        HIGHLIGHT_SLIDE
      );
    }

    const nextResolved = next === "system" ? systemTheme : next;
    if (nextResolved === resolvedTheme) setTheme(next);
    else setThemeWithReveal(next, origin, setTheme);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const target = (index + step + OPTIONS.length) % OPTIONS.length;
    const targetEl = optionRefs.current[target];
    targetEl?.focus();
    if (targetEl) choose(target, centreOf(targetEl));
  };

  return (
    <div className={styles.expandedToggle} role="radiogroup" aria-label="Theme">
      <span
        ref={highlightRef}
        className={styles.highlight}
        style={{ translate: highlightX(selectedIndex) }}
        aria-hidden="true"
      />
      {OPTIONS.map(({ value, label, Icon }, index) => {
        const checked = index === selectedIndex;
        return (
          <button
            key={value}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={(e) => choose(index, revealOrigin(e))}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={styles.option}
          >
            <Icon className={styles.optionIcon} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
