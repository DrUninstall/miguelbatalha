"use client";

import { useState, useCallback, CSSProperties } from "react";
import styles from "./gradient-demos.module.css";

// ─────────── Pointer Position Hook ───────────

type Point = { x: number; y: number };

const CENTER: Point = { x: 0.5, y: 0.5 };
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Tracks the pointer as 0–1 fractions of the element's box.
 * `capture: true` keeps a touch/pen drag attached to the element after it
 * leaves the box (pair it with `touch-action: none` in CSS).
 */
function usePointerPosition({ capture = false } = {}) {
  const [point, setPoint] = useState<Point>(CENTER);

  const update = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPoint({
      x: clamp((e.clientX - rect.left) / rect.width),
      y: clamp((e.clientY - rect.top) / rect.height),
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (capture) e.currentTarget.setPointerCapture(e.pointerId);
      update(e);
    },
    [capture, update]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Mouse updates on hover; touch/pen only while pressed (dragging).
      if (e.pointerType === "mouse" || e.buttons !== 0) update(e);
    },
    [update]
  );

  // A mouse leaving resets to the default; a finger lifting keeps its result.
  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") setPoint(CENTER);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 0.2 : 0.05;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (e.key === "Home" || e.key === "Escape") {
      e.preventDefault();
      setPoint(CENTER);
      return;
    }
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    setPoint((p) => ({ x: clamp(p.x + d[0]), y: clamp(p.y + d[1]) }));
  }, []);

  const style = { "--pointer-x": point.x, "--pointer-y": point.y } as CSSProperties;

  return {
    point,
    style,
    handlers: { onPointerDown, onPointerMove, onPointerLeave },
    onKeyDown,
  };
}

// ─────────── Gradient Types Demo ───────────

const pct = (n: number) => `${Math.round(n * 100)}%`;
const deg = (n: number) => `${Math.round(n * 360)}deg`;

export function GradientTypes() {
  const linear = usePointerPosition({ capture: true });
  const radial = usePointerPosition({ capture: true });
  const conic = usePointerPosition({ capture: true });

  const swatches = [
    {
      key: "linear",
      className: styles.linearGradient,
      state: linear,
      label: "Linear",
      description: "Along a line. Pointer X sets the angle.",
      aria: `Linear gradient at ${deg(linear.point.x)}`,
    },
    {
      key: "radial",
      className: styles.radialGradient,
      state: radial,
      label: "Radial",
      description: "Out from a centre that follows the pointer.",
      aria: `Radial gradient centred at ${pct(radial.point.x)} ${pct(radial.point.y)}`,
    },
    {
      key: "conic",
      className: styles.conicGradient,
      state: conic,
      label: "Conic",
      description: "Around a centre that follows the pointer; X also turns it.",
      aria: `Conic gradient from ${deg(conic.point.x)} at ${pct(conic.point.x)} ${pct(conic.point.y)}`,
    },
  ];

  return (
    <div className={styles.typesContainer}>
      {swatches.map(({ key, className, state, label, description, aria }) => (
        <div key={key} className={styles.gradientCard}>
          <div
            className={`${styles.gradientBox} ${styles.pointerSurface} ${className}`}
            style={state.style}
            {...state.handlers}
            tabIndex={0}
            role="group"
            aria-roledescription="gradient control"
            aria-label={`${aria}. Arrow keys move, Home resets.`}
            onKeyDown={state.onKeyDown}
          />
          <span className={styles.gradientLabel}>{label}</span>
          <span className={styles.gradientDescription}>{description}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────── Color Space Comparison Demo ───────────

const COLOR_PAIRS = [
  {
    id: "blue-yellow",
    name: "Blue → Yellow",
    from: "#0000ff",
    to: "#ffff00",
    notes: {
      srgb: "Straight line through the RGB cube. The midpoint is flat grey, rgb(128 128 128).",
      oklab: "Straight line in a perceptual space. Even lightness; the midpoint is a soft, greyish blue.",
      oklch: "Hue takes the shorter arc (264° → 110°), passing through cyan and green.",
    },
  },
  {
    id: "red-blue",
    name: "Red → Blue",
    from: "#ff0000",
    to: "#0000ff",
    notes: {
      srgb: "The midpoint is rgb(128 0 128), a dark purple that sags below both ends in lightness.",
      oklab: "Lightness stays even; the midpoint is a muted violet.",
      oklch: "Hue swings through magenta and chroma stays high, so the middle stays vivid.",
    },
  },
  {
    id: "green-magenta",
    name: "Green → Magenta",
    from: "#00ff00",
    to: "#ff00ff",
    notes: {
      srgb: "Straight line through the RGB cube. The midpoint is flat grey, darker than both ends.",
      oklab: "Lighter than sRGB, but the midpoint is still a near-grey: these are opposites in Oklab.",
      oklch: "Hue travels round through yellow, orange and red instead of cutting through grey.",
    },
  },
] as const;

const COLOR_SPACES = ["srgb", "oklab", "oklch"] as const;

export function GradientColorSpaces() {
  const [pairId, setPairId] = useState<(typeof COLOR_PAIRS)[number]["id"]>("blue-yellow");
  const pair = COLOR_PAIRS.find((p) => p.id === pairId) ?? COLOR_PAIRS[0];

  return (
    <div
      className={styles.colorSpaceContainer}
      style={{ "--from": pair.from, "--to": pair.to } as CSSProperties}
    >
      <div className={styles.segmented} role="group" aria-label="Gradient endpoints">
        {COLOR_PAIRS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.segment}
            aria-pressed={p.id === pairId}
            onClick={() => setPairId(p.id)}
          >
            <span
              className={styles.segmentChip}
              style={{ background: `linear-gradient(90deg, ${p.from} 50%, ${p.to} 50%)` }}
              aria-hidden="true"
            />
            {p.name}
          </button>
        ))}
      </div>

      {COLOR_SPACES.map((space) => (
        <div key={space} className={styles.colorSpaceRow}>
          <div className={styles.colorSpaceHeader}>
            <code className={styles.colorSpaceLabel}>in {space}</code>
            <span className={styles.midpoint}>
              <span className={styles.midpointLabel}>50%</span>
              <span
                className={`${styles.midpointSwatch} ${styles[`${space}Mid`]}`}
                aria-hidden="true"
              />
            </span>
          </div>
          <div
            className={`${styles.colorSpaceGradient} ${styles[space]}`}
            role="img"
            aria-label={`linear-gradient(to right in ${space}, ${pair.from}, ${pair.to})`}
          />
          <p className={styles.colorSpaceNote}>{pair.notes[space]}</p>
        </div>
      ))}

      <p className={styles.supportNote}>
        This browser doesn&apos;t support <code>in &lt;colorspace&gt;</code> in gradients, so all
        three rows are drawn with the default sRGB interpolation.
      </p>
    </div>
  );
}

// ─────────── Animated Gradient Demo ───────────

export function AnimatedGradient() {
  return (
    <div className={styles.animatedContainer}>
      <div className={styles.animatedGradient} role="img" aria-label="A gradient drifting sideways" />
      <span className={styles.animatedLabel}>
        <span className={styles.motionOnly}>
          A 200%-wide tile slides one full width every 12s, so the loop never jumps.
        </span>
        <span className={styles.reducedOnly}>
          Paused because your system asks for reduced motion.
        </span>
      </span>
    </div>
  );
}

// ─────────── Animated Border Gradient Demo ───────────

export function AnimatedBorderGradient() {
  return (
    <div className={styles.animatedContainer}>
      <div className={styles.borderWrapper}>
        <div className={styles.borderInner}>
          <span className={styles.borderTitle}>Gradient border</span>
          <code className={styles.borderCode}>conic-gradient(from var(--angle), …)</code>
        </div>
      </div>
      <span className={styles.animatedLabel}>
        <span className={styles.motionOnly}>
          A registered <code>--angle</code> turns 0° → 360° every 4s.
        </span>
        <span className={styles.reducedOnly}>
          Held at 135° because your system asks for reduced motion.
        </span>
      </span>
    </div>
  );
}

// ─────────── Layered Gradients Demo ───────────

export function LayeredGradients() {
  const mesh = usePointerPosition();
  const striped = usePointerPosition();
  const noise = usePointerPosition();

  return (
    <div className={styles.layeredContainer}>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.meshGradient}`}
          style={mesh.style}
          {...mesh.handlers}
        />
        <span className={styles.layeredLabel}>Mesh Gradient</span>
        <span className={styles.layeredDescription}>
          Six radial gradients over a dark linear base
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.stripedOverlay}`}
          style={striped.style}
          {...striped.handlers}
        />
        <span className={styles.layeredLabel}>Striped Overlay</span>
        <span className={styles.layeredDescription}>
          Repeating gradient over a linear one
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div
          className={`${styles.layeredBox} ${styles.noiseTexture}`}
          style={noise.style}
          {...noise.handlers}
        />
        <span className={styles.layeredLabel}>Noise Texture</span>
        <span className={styles.layeredDescription}>
          SVG turbulence blended over a gradient
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.glassScene}`}>
          <div className={styles.glassPanel}>
            <span className={styles.glassText}>Frosted glass</span>
          </div>
        </div>
        <span className={styles.layeredLabel}>Glass Effect</span>
        <span className={styles.layeredDescription}>
          Backdrop blur over layered shapes
        </span>
      </div>
    </div>
  );
}
