"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import styles from "./mouse-follow-pattern.module.css";

type Point = { x: number; y: number };

const SPRING_CONFIG = { stiffness: 300, damping: 30 };
// Enough shapes for the widest grid (20 columns x 6 rows). CSS decides how many
// columns fit (auto-fill) and clips everything below the sixth row, so the
// server HTML is already the right grid at every width; JS never counts columns.
const MAX_SHAPES = 20 * 6;
const SPOTLIGHT_RADIUS = 150; // px - opacity falls off to rest over this distance
const ROTATION_RADIUS = 100; // px - shapes further away than this return to rest
const REST_ANGLE = 90; // deg - a vertical 4x24 pill rotated 90deg lies horizontal
const REST_OPACITY = 0.2;

// Hermite smoothstep: 0 at t=0, 1 at t=1, zero slope at both ends.
function smoothstep(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

// Pills look identical at a and a+180deg, so pick whichever equivalent
// target angle is closest to the current one (shortest rotation path).
function findClosestEquivalent(current: number, target: number): number {
  const normalized = ((target % 180) + 180) % 180;
  const candidates = [normalized, normalized + 180, normalized - 180];
  let closest = candidates[0];
  for (const candidate of candidates) {
    if (Math.abs(current - candidate) < Math.abs(current - closest)) {
      closest = candidate;
    }
  }
  return closest;
}

function Shape({
  pointer,
  layoutVersion,
  reduceMotion,
}: {
  pointer: MotionValue<Point | null>;
  layoutVersion: number;
  reduceMotion: boolean;
}) {
  const shapeRef = useRef<HTMLDivElement>(null);
  // Shape centre relative to the container, cached so pointer moves never read layout.
  const centre = useRef<Point>({ x: 0, y: 0 });
  const rotation = useMotionValue(REST_ANGLE);
  const opacity = useMotionValue(REST_OPACITY);
  const springRotation = useSpring(rotation, SPRING_CONFIG);
  const springOpacity = useSpring(opacity, SPRING_CONFIG);

  // Re-measure whenever the parent reports a layout change (mount, resize, and
  // with it any change in how many columns CSS fits).
  // offsetLeft/Top ignore transforms, so the shape's own rotation never skews the cache.
  useLayoutEffect(() => {
    const el = shapeRef.current;
    if (!el) return;
    centre.current = {
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2,
    };
  }, [layoutVersion]);

  useEffect(() => {
    const update = (p: Point | null) => {
      if (!p) {
        rotation.set(findClosestEquivalent(rotation.get(), REST_ANGLE));
        opacity.set(REST_OPACITY);
        return;
      }
      const dx = p.x - centre.current.x;
      const dy = p.y - centre.current.y;
      const distance = Math.hypot(dx, dy);

      const angle =
        distance < ROTATION_RADIUS
          ? Math.atan2(dy, dx) * (180 / Math.PI) + 90
          : REST_ANGLE;
      rotation.set(findClosestEquivalent(rotation.get(), angle));

      // 1 at the pointer, 0 at SPOTLIGHT_RADIUS and beyond, eased with smoothstep.
      const intensity = smoothstep(1 - distance / SPOTLIGHT_RADIUS);
      opacity.set(REST_OPACITY + (1 - REST_OPACITY) * intensity);
    };
    return pointer.on("change", update);
  }, [pointer, rotation, opacity]);

  return (
    <motion.div
      ref={shapeRef}
      className={styles.shape}
      style={{
        rotate: reduceMotion ? rotation : springRotation,
        opacity: reduceMotion ? opacity : springOpacity,
      }}
    />
  );
}

export function MouseFollowPattern() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useMotionValue<Point | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [layoutVersion, setLayoutVersion] = useState(0);

  // Layout is pure CSS; this only tells the shapes to re-read their positions.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setLayoutVersion((v) => v + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const track = (e: React.PointerEvent<HTMLDivElement>) => {
    // The only layout read per move: one rect for the container.
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.set({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const reset = () => pointer.set(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    // Keep receiving moves for this finger/pen even if it wanders off the grid.
    e.currentTarget.setPointerCapture(e.pointerId);
    track(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Mouse follows on hover; touch/pen only while pressed.
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    track(e);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") reset();
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={reset}
      onPointerLeave={reset}
    >
      <div className={styles.grid}>
        {Array.from({ length: MAX_SHAPES }, (_, i) => (
          <Shape
            key={i}
            pointer={pointer}
            layoutVersion={layoutVersion}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
