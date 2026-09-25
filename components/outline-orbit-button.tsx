"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./outline-orbit-button.module.css";

const STROKE_WIDTH = 2;
// The dash pattern is "4 4", and the keyframes move it by whole periods.
const DASH_PERIOD = 8;
const SPEED_RAMP_MS = 600;
// The curve --ease-out-cubic (cubic-bezier(0.215, 0.61, 0.355, 1)) approximates.
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Each ring's size relative to the button. Direction comes from its CSS class:
// inner and outer run clockwise, middle counter-clockwise.
const RINGS = [
  { widthMult: 1, heightMult: 1, className: styles.orbitInner },
  { widthMult: 1.28, heightMult: 2, className: styles.orbitMiddle },
  { widthMult: 1.56, heightMult: 3, className: styles.orbitOuter },
];

type Size = { width: number; height: number };

// Perimeter of a pill: two straight sides plus two half circles.
function pillPerimeter({ width, height }: Size) {
  const diameter = Math.min(width, height);
  return 2 * Math.abs(width - height) + Math.PI * diameter;
}

interface OutlineOrbitButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A button with three dashed rings that stay still until it is hovered with a
 * mouse or focused from the keyboard. Then the dashes accelerate into an orbit,
 * and coast to a stop where they are when it ends.
 */
export function OutlineOrbitButton({ children, onClick }: OutlineOrbitButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);
  // Null until measured: the rings are only drawn at the button's real size.
  const [size, setSize] = useState<Size | null>(null);
  const rateRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const isActive = (isHovered || isFocusVisible) && isOnScreen;

  useLayoutEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize[0];
      setSize({ width: box.inlineSize, height: box.blockSize });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A keyboard user can scroll a focused button away; it stops orbiting there.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The orbit is a CSS loop that starts paused. Activating plays it and eases
  // its playbackRate from 0 to 1; deactivating eases it back to 0 and pauses.
  // Changing playbackRate keeps each animation's position, so the dashes speed
  // up from where they are and stop where they are.
  const hasRings = size !== null;
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || !hasRings || reduceMotion) return;
    const rings = el
      .getAnimations({ subtree: true })
      .filter((a) => a instanceof CSSAnimation && a.animationName.startsWith("orbit"));
    const setRate = (rate: number) => {
      rateRef.current = rate;
      for (const ring of rings) ring.playbackRate = rate;
    };

    const from = rateRef.current;
    const to = isActive ? 1 : 0;
    if (from === to) return;
    if (isActive) for (const ring of rings) ring.play();
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / SPEED_RAMP_MS, 1);
      setRate(from + (to - from) * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else if (!isActive) for (const ring of rings) ring.pause();
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isActive, hasRings, reduceMotion]);

  const className = `${styles.container} ${isActive ? styles.active : ""}`;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      onClick={onClick}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocus={(e) => setIsFocusVisible(e.currentTarget.matches(":focus-visible"))}
      onBlur={() => setIsFocusVisible(false)}
    >
      <span className={styles.buttonText}>{children}</span>
      <span className={styles.buttonBg} aria-hidden />

      {size &&
        RINGS.map((ring) => {
          const ringSize = {
            width: size.width * ring.widthMult,
            height: size.height * ring.heightMult,
          };
          // A whole number of dash periods around the ring, so the pattern
          // meets itself where the path starts and there is no seam.
          const pathLength =
            Math.max(1, Math.round(pillPerimeter(ringSize) / DASH_PERIOD)) * DASH_PERIOD;
          return (
            <svg
              key={ring.className}
              className={styles.orbitSvg}
              aria-hidden
              width={ringSize.width + STROKE_WIDTH}
              height={ringSize.height + STROKE_WIDTH}
            >
              <rect
                x={STROKE_WIDTH / 2}
                y={STROKE_WIDTH / 2}
                width={ringSize.width}
                height={ringSize.height}
                rx={Math.min(ringSize.width, ringSize.height) / 2}
                pathLength={pathLength}
                fill="none"
                strokeWidth={STROKE_WIDTH}
                strokeDasharray="4 4"
                className={`${styles.orbit} ${ring.className}`}
              />
            </svg>
          );
        })}
    </button>
  );
}
