"use client";

import { useState, useCallback, CSSProperties } from "react";
import styles from "./gradient-demos.module.css";

// ─────────── Mouse Position Hook ───────────

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0.5, y: 0.5, isHovering: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPosition({ x, y, isHovering: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0.5, y: 0.5, isHovering: false });
  }, []);

  return { ...position, handleMouseMove, handleMouseLeave };
}

// ─────────── Gradient Types Demo ───────────

export function GradientTypes() {
  const linear = useMousePosition();
  const radial = useMousePosition();
  const conic = useMousePosition();

  return (
    <div className={styles.typesContainer}>
      <div className={styles.gradientCard}>
        <div
          className={`${styles.gradientBox} ${styles.linearGradient} ${styles.interactive}`}
          onMouseMove={linear.handleMouseMove}
          onMouseLeave={linear.handleMouseLeave}
          style={{
            "--mouse-x": linear.x,
            "--mouse-y": linear.y,
          } as CSSProperties}
        />
        <span className={styles.gradientLabel}>Linear</span>
        <span className={styles.gradientDescription}>
          Blends along a straight line
        </span>
      </div>
      <div className={styles.gradientCard}>
        <div
          className={`${styles.gradientBox} ${styles.radialGradient} ${styles.interactive}`}
          onMouseMove={radial.handleMouseMove}
          onMouseLeave={radial.handleMouseLeave}
          style={{
            "--mouse-x": radial.x,
            "--mouse-y": radial.y,
          } as CSSProperties}
        />
        <span className={styles.gradientLabel}>Radial</span>
        <span className={styles.gradientDescription}>
          Radiates from center point
        </span>
      </div>
      <div className={styles.gradientCard}>
        <div
          className={`${styles.gradientBox} ${styles.conicGradient} ${styles.interactive}`}
          onMouseMove={conic.handleMouseMove}
          onMouseLeave={conic.handleMouseLeave}
          style={{
            "--mouse-x": conic.x,
            "--mouse-y": conic.y,
          } as CSSProperties}
        />
        <span className={styles.gradientLabel}>Conic</span>
        <span className={styles.gradientDescription}>
          Rotates around a point
        </span>
      </div>
    </div>
  );
}

// ─────────── Color Space Comparison Demo ───────────

export function GradientColorSpaces() {
  const srgb = useMousePosition();
  const lab = useMousePosition();

  return (
    <div className={styles.colorSpaceContainer}>
      <div className={styles.colorSpaceRow}>
        <div
          className={`${styles.colorSpaceGradient} ${styles.srgbGradient} ${styles.interactive}`}
          onMouseMove={srgb.handleMouseMove}
          onMouseLeave={srgb.handleMouseLeave}
          style={{
            "--mouse-x": srgb.x,
          } as CSSProperties}
        />
        <div className={styles.colorSpaceInfo}>
          <span className={styles.colorSpaceLabel}>sRGB (default)</span>
          <span className={styles.colorSpaceNote}>
            Goes through muddy purple
          </span>
        </div>
      </div>
      <div className={styles.colorSpaceRow}>
        <div
          className={`${styles.colorSpaceGradient} ${styles.labGradient} ${styles.interactive}`}
          onMouseMove={lab.handleMouseMove}
          onMouseLeave={lab.handleMouseLeave}
          style={{
            "--mouse-x": lab.x,
          } as CSSProperties}
        />
        <div className={styles.colorSpaceInfo}>
          <span className={styles.colorSpaceLabel}>LAB</span>
          <span className={styles.colorSpaceNote}>
            Perceptually uniform transition
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────── Animated Gradient Demo ───────────

export function AnimatedGradient() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className={styles.animatedContainer}>
      <div
        className={`${styles.animatedGradient} ${isHovering ? styles.animatedFast : ""}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
      <span className={styles.animatedLabel}>
        Hover to speed up animation
      </span>
    </div>
  );
}

// ─────────── Animated Border Gradient Demo ───────────

export function AnimatedBorderGradient() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className={styles.animatedContainer}>
      <div
        className={`${styles.animatedBorderWrapper} ${isHovering ? styles.animatedFast : ""}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={styles.animatedBorderInner}>
          <span className={styles.animatedBorderText}>
            Gradient border effect
          </span>
        </div>
      </div>
      <span className={styles.animatedLabel}>
        Hover to speed up animation
      </span>
    </div>
  );
}

// ─────────── Layered Gradients Demo ───────────

export function LayeredGradients() {
  const mesh = useMousePosition();
  const striped = useMousePosition();
  const noise = useMousePosition();
  const glass = useMousePosition();

  return (
    <div className={styles.layeredContainer}>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.meshGradient} ${styles.interactive}`}
          onMouseMove={mesh.handleMouseMove}
          onMouseLeave={mesh.handleMouseLeave}
          style={{
            "--mouse-x": mesh.x,
            "--mouse-y": mesh.y,
          } as CSSProperties}
        />
        <span className={styles.layeredLabel}>Mesh Gradient</span>
        <span className={styles.layeredDescription}>
          Multiple radial gradients layered
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.stripedOverlay} ${styles.interactive}`}
          onMouseMove={striped.handleMouseMove}
          onMouseLeave={striped.handleMouseLeave}
          style={{
            "--mouse-x": striped.x,
            "--mouse-y": striped.y,
          } as CSSProperties}
        />
        <span className={styles.layeredLabel}>Striped Overlay</span>
        <span className={styles.layeredDescription}>
          Repeating gradient over solid
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.noiseTexture} ${styles.interactive}`}
          onMouseMove={noise.handleMouseMove}
          onMouseLeave={noise.handleMouseLeave}
          style={{
            "--mouse-x": noise.x,
            "--mouse-y": noise.y,
          } as CSSProperties}
        />
        <span className={styles.layeredLabel}>Noise Texture</span>
        <span className={styles.layeredDescription}>
          SVG noise over gradient
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.glassEffect} ${styles.interactive}`}
          onMouseMove={glass.handleMouseMove}
          onMouseLeave={glass.handleMouseLeave}
          style={{
            "--mouse-x": glass.x,
            "--mouse-y": glass.y,
          } as CSSProperties}
        />
        <span className={styles.layeredLabel}>Glass Effect</span>
        <span className={styles.layeredDescription}>
          Gradient with backdrop blur
        </span>
      </div>
    </div>
  );
}
