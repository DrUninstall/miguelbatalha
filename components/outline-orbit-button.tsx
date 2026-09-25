"use client";

import { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useDemoPaused } from "@/components/demo-pause";
import styles from "./outline-orbit-button.module.css";

// Animation constants. The orbit loop itself is CSS (@keyframes in the module:
// each ring's stroke-dashoffset runs 0 → ±64 over 3s, linear, infinite). JS
// only changes how fast that loop plays.
const STROKE_WIDTH = 2;
const HOVER_SPEED = 2.5; // playback-rate multiplier while hovered / keyboard-focused
const SPEED_RAMP_MS = 600;
// Ease-out cubic, the curve --ease-out-cubic (cubic-bezier(0.215, 0.61, 0.355, 1)) approximates
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Proportional multipliers for orbit layers. Direction is set by each ring's
// CSS class: inner and outer run clockwise (dashoffset 0 → -64), middle
// counter-clockwise (0 → +64).
const ORBIT_MULTIPLIERS = [
  { widthMult: 1, heightMult: 1 }, // Inner - matches button
  { widthMult: 1.28, heightMult: 2 }, // Middle
  { widthMult: 1.56, heightMult: 3 }, // Outer
];
const ORBIT_CLASSES = [styles.orbitInner, styles.orbitMiddle, styles.orbitOuter];

interface OutlineOrbitButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  target?: string;
  className?: string;
}

export function OutlineOrbitButton({
  children,
  onClick,
  href,
  target,
  className,
}: OutlineOrbitButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);
  const isActive = isHovered || isFocusVisible;
  const reduceMotion = useReducedMotion();
  const paused = useDemoPaused();
  const [dimensions, setDimensions] = useState({ width: 200, height: 56 });
  const containerRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const rateRef = useRef(1);

  // Measure button dimensions on mount and resize
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setDimensions({ width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause the CSS loop while the button is off-screen (a class sets
  // animation-play-state: paused), so it isn't repainting dashes nobody sees.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsOnScreen(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Calculate proportional orbit sizes based on measured dimensions
  const rectangles = useMemo(
    () =>
      ORBIT_MULTIPLIERS.map(({ widthMult, heightMult }) => ({
        width: dimensions.width * widthMult,
        height: dimensions.height * heightMult,
      })),
    [dimensions]
  );

  // Hover / keyboard focus speeds the loop up rather than restarting it: the
  // rings' CSS animations get their playbackRate eased from 1 to HOVER_SPEED
  // (and back) over 600ms. Setting playbackRate keeps each animation's current
  // position, so the dashes just accelerate. While the demo is paused the rate
  // is set directly (no ramp) and the animations stay paused.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduceMotion) return;
    const animations = el
      .getAnimations({ subtree: true })
      .filter((a) => a instanceof CSSAnimation);
    const setRate = (rate: number) => {
      rateRef.current = rate;
      for (const a of animations) a.playbackRate = rate;
    };

    const from = rateRef.current;
    const to = isActive ? HOVER_SPEED : 1;
    if (paused || from === to) {
      setRate(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / SPEED_RAMP_MS, 1);
      setRate(from + (to - from) * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, paused, reduceMotion]);

  const pointerHandlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setIsHovered(true);
    },
    onPointerLeave: () => setIsHovered(false),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      setIsFocusVisible(e.currentTarget.matches(":focus-visible")),
    onBlur: () => setIsFocusVisible(false),
  };

  const containerClass = `${styles.container} ${isActive ? styles.hovered : ""} ${isOnScreen ? "" : styles.offScreen} ${className || ""}`;

  const content = (
    <>
      <span className={styles.buttonText}>{children}</span>
      <span className={styles.buttonBg} aria-hidden />

      {/* SVG orbit layers */}
      {rectangles.map((rect, index) => (
        <svg
          key={index}
          className={styles.orbitSvg}
          aria-hidden
          width={rect.width + STROKE_WIDTH}
          height={rect.height + STROKE_WIDTH}
          viewBox={`0 0 ${rect.width + STROKE_WIDTH} ${rect.height + STROKE_WIDTH}`}
        >
          <rect
            x={STROKE_WIDTH / 2}
            y={STROKE_WIDTH / 2}
            width={rect.width}
            height={rect.height}
            rx={rect.height / 2}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray="4 4"
            className={`${styles.orbit} ${ORBIT_CLASSES[index]}`}
          />
        </svg>
      ))}
    </>
  );

  // Render as Link if href is provided, otherwise as button
  if (href) {
    return (
      <Link
        ref={containerRef}
        href={href}
        target={target}
        className={containerClass}
        {...pointerHandlers}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={containerRef}
      type="button"
      className={containerClass}
      onClick={onClick}
      {...pointerHandlers}
    >
      {content}
    </button>
  );
}
