"use client";

import { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  animate,
} from "framer-motion";
import styles from "./outline-orbit-button.module.css";

// Animation constants
const STROKE_WIDTH = 2;
const ANIMATION_DURATION = 3; // s per loop at normal speed
const HOVER_SPEED = 2.5; // playback-rate multiplier while hovered / keyboard-focused
const SPEED_RAMP = { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const };

// Proportional multipliers for orbit layers (based on original ratios)
const ORBIT_MULTIPLIERS = [
  { widthMult: 1, heightMult: 1, offsetEnd: -64 },      // Inner - matches button
  { widthMult: 1.28, heightMult: 2, offsetEnd: 64 },    // Middle - clockwise
  { widthMult: 1.56, heightMult: 3, offsetEnd: -64 },   // Outer - counter-clockwise
];

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
  const isActive = isHovered || isFocusVisible;
  const reduceMotion = useReducedMotion();
  const [dimensions, setDimensions] = useState({ width: 200, height: 56 });
  const containerRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const progress = useMotionValue(0);
  const speed = useMotionValue(1);

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

  // Calculate proportional orbit sizes based on measured dimensions
  const rectangles = useMemo(() =>
    ORBIT_MULTIPLIERS.map(({ widthMult, heightMult, offsetEnd }) => ({
      width: dimensions.width * widthMult,
      height: dimensions.height * heightMult,
      offsetEnd,
    })),
    [dimensions]
  );

  // Transform progress to strokeDashoffset for each layer
  const innerOffset = useTransform(progress, [0, 1], [0, rectangles[0].offsetEnd]);
  const middleOffset = useTransform(progress, [0, 1], [0, rectangles[1].offsetEnd]);
  const outerOffset = useTransform(progress, [0, 1], [0, rectangles[2].offsetEnd]);

  const offsets = [innerOffset, middleOffset, outerOffset];

  // Master loop: one linear 0 -> 1 tween repeated forever. Not started at all
  // under reduced motion (the dashed orbits then render static).
  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(progress, 1, {
      duration: ANIMATION_DURATION,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    // Hover changes the loop's playback rate rather than restarting it, so the
    // dashes keep their position and just accelerate/decelerate.
    controls.speed = speed.get();
    const unsubscribe = speed.on("change", (v) => {
      controls.speed = v;
    });
    return () => {
      unsubscribe();
      controls.stop();
    };
  }, [progress, speed, reduceMotion]);

  // Ease the playback rate between 1x and HOVER_SPEED.
  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(speed, isActive ? HOVER_SPEED : 1, SPEED_RAMP);
    return () => controls.stop();
  }, [isActive, speed, reduceMotion]);

  const pointerHandlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setIsHovered(true);
    },
    onPointerLeave: () => setIsHovered(false),
    onFocus: (e: React.FocusEvent<HTMLElement>) =>
      setIsFocusVisible(e.currentTarget.matches(":focus-visible")),
    onBlur: () => setIsFocusVisible(false),
  };

  const containerClass = `${styles.container} ${isActive ? styles.hovered : ""} ${className || ""}`;

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
          <motion.rect
            x={STROKE_WIDTH / 2}
            y={STROKE_WIDTH / 2}
            width={rect.width}
            height={rect.height}
            rx={rect.height / 2}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray="4 4"
            style={{ strokeDashoffset: offsets[index] }}
            className={
              index === 0
                ? styles.orbitInner
                : index === 1
                ? styles.orbitMiddle
                : styles.orbitOuter
            }
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
