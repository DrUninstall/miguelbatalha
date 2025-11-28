"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "./mouse-follow-pattern.module.css";

const SPRING_CONFIG = { stiffness: 300, damping: 30 };
const GRID_COLS = 20;
const GRID_ROWS = 6;
const SPOTLIGHT_RADIUS = 150; // px - shapes fade beyond this
const ROTATION_RADIUS = 100; // px - shapes outside this don't rotate

// Find the closest equivalent angle accounting for 180° symmetry
// Pills look the same at 0° and 180°, so we pick the shortest path
function findClosestEquivalent(current: number, target: number): number {
  const normalized = ((target % 180) + 180) % 180;
  const candidates = [normalized, normalized + 180, normalized - 180];

  let closest = candidates[0];
  let minDiff = Math.abs(current - candidates[0]);

  for (const candidate of candidates) {
    const diff = Math.abs(current - candidate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = candidate;
    }
  }

  return closest;
}

function Shape({
  index,
  mouseX,
  mouseY,
  containerRef,
}: {
  index: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const shapeRef = useRef<HTMLDivElement>(null);
  const rotation = useMotionValue(90); // Start vertical
  const opacity = useMotionValue(0.2);

  const springRotation = useSpring(rotation, SPRING_CONFIG);
  const springOpacity = useSpring(opacity, SPRING_CONFIG);

  useEffect(() => {
    const updateShape = () => {
      if (!shapeRef.current || !containerRef.current) return;

      const shapeRect = shapeRef.current.getBoundingClientRect();
      const shapeCenterX = shapeRect.left + shapeRect.width / 2;
      const shapeCenterY = shapeRect.top + shapeRect.height / 2;

      const mx = mouseX.get();
      const my = mouseY.get();

      // If mouse is outside container (position is 0,0), reset to vertical
      if (mx === 0 && my === 0) {
        rotation.set(findClosestEquivalent(rotation.get(), 90));
        opacity.set(0.2);
        return;
      }

      const deltaX = mx - shapeCenterX;
      const deltaY = my - shapeCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Rotation: point toward cursor if within range
      if (distance < ROTATION_RADIUS) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
        rotation.set(findClosestEquivalent(rotation.get(), angle));
      } else {
        rotation.set(findClosestEquivalent(rotation.get(), 90));
      }

      // Opacity: spotlight effect based on distance
      const normalizedDistance = Math.min(distance / SPOTLIGHT_RADIUS, 1);
      const newOpacity = 1 - normalizedDistance * 0.8; // Range: 0.2 to 1
      opacity.set(newOpacity);
    };

    const unsubX = mouseX.on("change", updateShape);
    const unsubY = mouseY.on("change", updateShape);

    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY, rotation, opacity, containerRef]);

  return (
    <motion.div
      ref={shapeRef}
      className={styles.shape}
      style={{
        rotate: springRotation,
        opacity: springOpacity,
      }}
    />
  );
}

export function MouseFollowPattern() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const shapes = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.grid}>
        {shapes.map((index) => (
          <Shape
            key={index}
            index={index}
            mouseX={mouseX}
            mouseY={mouseY}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}
