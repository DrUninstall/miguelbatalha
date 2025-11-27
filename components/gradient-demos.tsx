"use client";

import styles from "./gradient-demos.module.css";

// ─────────── Gradient Types Demo ───────────

export function GradientTypes() {
  return (
    <div className={styles.typesContainer}>
      <div className={styles.gradientCard}>
        <div className={`${styles.gradientBox} ${styles.linearGradient}`} />
        <span className={styles.gradientLabel}>Linear</span>
        <span className={styles.gradientDescription}>
          Blends along a straight line
        </span>
      </div>
      <div className={styles.gradientCard}>
        <div className={`${styles.gradientBox} ${styles.radialGradient}`} />
        <span className={styles.gradientLabel}>Radial</span>
        <span className={styles.gradientDescription}>
          Radiates from center point
        </span>
      </div>
      <div className={styles.gradientCard}>
        <div className={`${styles.gradientBox} ${styles.conicGradient}`} />
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
  return (
    <div className={styles.colorSpaceContainer}>
      <div className={styles.colorSpaceRow}>
        <div className={`${styles.colorSpaceGradient} ${styles.srgbGradient}`} />
        <div className={styles.colorSpaceInfo}>
          <span className={styles.colorSpaceLabel}>sRGB (default)</span>
          <span className={styles.colorSpaceNote}>
            Goes through muddy purple
          </span>
        </div>
      </div>
      <div className={styles.colorSpaceRow}>
        <div className={`${styles.colorSpaceGradient} ${styles.labGradient}`} />
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
  return (
    <div className={styles.animatedContainer}>
      <div className={styles.animatedGradient} />
      <span className={styles.animatedLabel}>
        Animates background-position on an oversized gradient (400% width)
      </span>
    </div>
  );
}

// ─────────── Animated Border Gradient Demo ───────────

export function AnimatedBorderGradient() {
  return (
    <div className={styles.animatedContainer}>
      <div className={styles.animatedBorderWrapper}>
        <div className={styles.animatedBorderInner}>
          <span className={styles.animatedBorderText}>
            Gradient border effect
          </span>
        </div>
      </div>
      <span className={styles.animatedLabel}>
        Animated gradient as a border using padding + inner background
      </span>
    </div>
  );
}

// ─────────── Layered Gradients Demo ───────────

export function LayeredGradients() {
  return (
    <div className={styles.layeredContainer}>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.meshGradient}`} />
        <span className={styles.layeredLabel}>Mesh Gradient</span>
        <span className={styles.layeredDescription}>
          Multiple radial gradients layered
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.stripedOverlay}`} />
        <span className={styles.layeredLabel}>Striped Overlay</span>
        <span className={styles.layeredDescription}>
          Repeating gradient over solid
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.noiseTexture}`} />
        <span className={styles.layeredLabel}>Noise Texture</span>
        <span className={styles.layeredDescription}>
          SVG noise over gradient
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.glassEffect}`} />
        <span className={styles.layeredLabel}>Glass Effect</span>
        <span className={styles.layeredDescription}>
          Gradient with backdrop blur
        </span>
      </div>
    </div>
  );
}
