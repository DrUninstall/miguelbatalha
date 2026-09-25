"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./gradient-demos.module.css";

// ─────────── Pointer surface ───────────

type Point = { x: number; y: number };

/** Must match the `initial-value` of the `@property --pointer-x/-y` rules in the CSS. */
const CENTER: Point = { x: 0.5, y: 0.5 };

const KEY_DIRECTIONS: Partial<Record<string, Point>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

function place(el: HTMLElement, p: Point) {
  el.style.setProperty("--pointer-x", String(p.x));
  el.style.setProperty("--pointer-y", String(p.y));
}

/** Removing the inline values lets the registered properties ease back to their initial value. */
function unplace(el: HTMLElement) {
  el.style.removeProperty("--pointer-x");
  el.style.removeProperty("--pointer-y");
}

/**
 * Writes the pointer position, as 0–1 fractions of the element's box, straight
 * to `--pointer-x` / `--pointer-y` on the element. Nothing re-renders per move;
 * `onSettle` reports the position once it stops changing (release, leave, key).
 * `capture` keeps a touch/pen drag attached after it leaves the box (pair it
 * with `touch-action: none`).
 */
function usePointerSurface({
  capture = false,
  onSettle,
}: { capture?: boolean; onSettle?: (p: Point) => void } = {}) {
  const latest = useRef(CENTER);

  const moveTo = (el: HTMLElement, p: Point) => {
    latest.current = p;
    place(el, p);
  };

  const reset = (el: HTMLElement) => {
    latest.current = CENTER;
    unplace(el);
    onSettle?.(CENTER);
  };

  const fromPointer = (e: React.PointerEvent<HTMLElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / rect.width),
      y: clamp((e.clientY - rect.top) / rect.height),
    };
  };

  const pointer = {
    onPointerDown(e: React.PointerEvent<HTMLElement>) {
      if (capture) e.currentTarget.setPointerCapture(e.pointerId);
      moveTo(e.currentTarget, fromPointer(e));
    },
    onPointerMove(e: React.PointerEvent<HTMLElement>) {
      // Mouse updates on hover; touch/pen only while pressed (dragging).
      if (e.pointerType === "mouse" || e.buttons !== 0) moveTo(e.currentTarget, fromPointer(e));
    },
    onPointerUp() {
      onSettle?.(latest.current);
    },
    // A mouse leaving returns to the centre; a finger lifting keeps its result.
    onPointerLeave(e: React.PointerEvent<HTMLElement>) {
      if (e.pointerType === "mouse") reset(e.currentTarget);
    },
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Home" || e.key === "Escape") {
      e.preventDefault();
      reset(e.currentTarget);
      return;
    }
    const direction = KEY_DIRECTIONS[e.key];
    if (!direction) return;
    e.preventDefault();
    const step = e.shiftKey ? 0.2 : 0.05;
    const next = {
      x: clamp(latest.current.x + direction.x * step),
      y: clamp(latest.current.y + direction.y * step),
    };
    moveTo(e.currentTarget, next);
    onSettle?.(next);
  };

  return { pointer, onKeyDown };
}

// ─────────── Gradient Types Demo ───────────

const pct = (n: number) => `${Math.round(n * 100)}%`;
const deg = (n: number) => `${Math.round(n * 360)}deg`;

type Swatch = {
  className: string;
  label: string;
  description: string;
  describe: (p: Point) => string;
};

const SWATCHES: Swatch[] = [
  {
    className: styles.linearGradient,
    label: "Linear",
    description: "Along a line. Pointer X sets the angle.",
    describe: (p) => `Linear gradient at ${deg(p.x)}`,
  },
  {
    className: styles.radialGradient,
    label: "Radial",
    description: "Out from a centre that follows the pointer.",
    describe: (p) => `Radial gradient centred at ${pct(p.x)} ${pct(p.y)}`,
  },
  {
    className: styles.conicGradient,
    label: "Conic",
    description: "Around a centre that follows the pointer; X also turns it.",
    describe: (p) => `Conic gradient from ${deg(p.x)} at ${pct(p.x)} ${pct(p.y)}`,
  },
];

function GradientSwatch({ className, label, description, describe }: Swatch) {
  const [settled, setSettled] = useState(CENTER);
  const { pointer, onKeyDown } = usePointerSurface({ capture: true, onSettle: setSettled });

  return (
    <div className={styles.gradientCard}>
      <div
        className={`${styles.gradientBox} ${styles.pointerSurface} ${className}`}
        {...pointer}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-roledescription="gradient control"
        aria-label={`${describe(settled)}. Arrow keys move, Home resets.`}
      />
      <span className={styles.gradientLabel}>{label}</span>
      <span className={styles.gradientDescription}>{description}</span>
    </div>
  );
}

export function GradientTypes() {
  return (
    <div className={styles.typesContainer}>
      {SWATCHES.map((swatch) => (
        <GradientSwatch key={swatch.label} {...swatch} />
      ))}
    </div>
  );
}

// ─────────── Color Space Comparison Demo ───────────

type Interpolation = "srgb" | "oklab" | "oklch" | "oklchLonger";

const INTERPOLATIONS = {
  srgb: { syntax: "in srgb", gradient: styles.srgb, midpoint: styles.srgbMid },
  oklab: { syntax: "in oklab", gradient: styles.oklab, midpoint: styles.oklabMid },
  oklch: { syntax: "in oklch", gradient: styles.oklch, midpoint: styles.oklchMid },
  oklchLonger: {
    syntax: "in oklch longer hue",
    gradient: styles.oklchLonger,
    midpoint: styles.oklchLongerMid,
  },
} satisfies Record<Interpolation, { syntax: string; gradient: string; midpoint: string }>;

type Pair = {
  name: string;
  from: string;
  to: string;
  notes: Record<Interpolation, string>;
};

const BLUE_YELLOW: Pair = {
  name: "Blue → Yellow",
  from: "#0000ff",
  to: "#ffff00",
  notes: {
    srgb: "Straight line through the RGB cube. The midpoint is flat grey, rgb(128 128 128).",
    oklab:
      "Straight line in a perceptual space. Blue and yellow are 154° apart in Oklab, not opposite, so the line misses grey: the midpoint is a muted steel blue.",
    oklch:
      "Hue takes the shorter arc (264° → 110°) through cyan and green. Most of that path is outside sRGB and gets clipped; the hard edge in the green is where the clipping stops.",
    oklchLonger: "The long way round, up through 0°: violet, pink, red and orange.",
  },
};

const RED_BLUE: Pair = {
  name: "Red → Blue",
  from: "#ff0000",
  to: "#0000ff",
  notes: {
    srgb: "The midpoint is rgb(128 0 128), a dark purple that sags below both ends in lightness.",
    oklab: "Lightness stays even; the midpoint is a muted violet.",
    oklch: "Hue swings through magenta and chroma stays high, so the middle stays vivid.",
    oklchLonger: "The other way round: orange, green and teal, everything the short arc skipped.",
  },
};

const GREEN_MAGENTA: Pair = {
  name: "Green → Magenta",
  from: "#00ff00",
  to: "#ff00ff",
  notes: {
    srgb: "Straight line through the RGB cube. The midpoint is flat grey, darker than both ends.",
    oklab:
      "Lighter than sRGB, but the midpoint is still a near-grey: these two are 186° apart in Oklab, close to opposite.",
    oklch:
      "186° apart, so the shorter arc goes backwards, through yellow, orange and red instead of cutting through grey.",
    oklchLonger:
      "Only 12° further than the short way: through cyan, blue and violet. Pairs this close to 180° flip direction if an endpoint moves a few degrees.",
  },
};

const COLOR_PAIRS = [BLUE_YELLOW, RED_BLUE, GREEN_MAGENTA];

function ColorSpaceRow({
  pair,
  interpolation,
  control,
}: {
  pair: Pair;
  interpolation: Interpolation;
  control?: ReactNode;
}) {
  const { syntax, gradient, midpoint } = INTERPOLATIONS[interpolation];

  return (
    <div className={styles.colorSpaceRow}>
      <div className={styles.colorSpaceHeader}>
        <div className={styles.colorSpaceTitle}>
          <code className={styles.colorSpaceLabel}>{syntax}</code>
          {control}
        </div>
        <span className={styles.midpoint}>
          <span className={styles.midpointLabel}>50%</span>
          <span className={`${styles.midpointSwatch} ${midpoint}`} aria-hidden="true" />
        </span>
      </div>
      <div
        className={`${styles.colorSpaceGradient} ${gradient}`}
        role="img"
        aria-label={`linear-gradient(to right ${syntax}, ${pair.from}, ${pair.to})`}
      />
      <p className={styles.colorSpaceNote}>{pair.notes[interpolation]}</p>
    </div>
  );
}

export function GradientColorSpaces() {
  const [pair, setPair] = useState(BLUE_YELLOW);
  const [longerHue, setLongerHue] = useState(false);

  return (
    <div
      className={styles.colorSpaceContainer}
      style={{ "--from": pair.from, "--to": pair.to }}
    >
      <div className={styles.segmented} role="group" aria-label="Gradient endpoints">
        {COLOR_PAIRS.map((p) => (
          <button
            key={p.name}
            type="button"
            className={styles.segment}
            aria-pressed={p === pair}
            onClick={() => setPair(p)}
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

      <ColorSpaceRow pair={pair} interpolation="srgb" />
      <ColorSpaceRow pair={pair} interpolation="oklab" />
      <ColorSpaceRow
        pair={pair}
        interpolation={longerHue ? "oklchLonger" : "oklch"}
        control={
          <div
            className={`${styles.segmented} ${styles.hueToggle}`}
            role="group"
            aria-label="Hue direction"
          >
            {[false, true].map((longer) => (
              <button
                key={String(longer)}
                type="button"
                className={styles.segment}
                aria-pressed={longerHue === longer}
                onClick={() => setLongerHue(longer)}
              >
                {longer ? "Longer" : "Shorter"}
              </button>
            ))}
          </div>
        }
      />

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
      <div className={styles.borderCard}>
        <span className={styles.borderTitle}>Gradient border</span>
        <code className={styles.borderCode}>conic-gradient(from var(--angle), …) border-box</code>
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
  const mesh = usePointerSurface();
  const striped = usePointerSurface();
  const noise = usePointerSurface();

  return (
    <div className={styles.layeredContainer}>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.meshGradient}`} {...mesh.pointer} />
        <span className={styles.layeredLabel}>Mesh gradient</span>
        <span className={styles.layeredDescription}>
          Six radial gradients over a dark linear base
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.stripedOverlay}`} {...striped.pointer} />
        <span className={styles.layeredLabel}>Striped overlay</span>
        <span className={styles.layeredDescription}>
          Repeating gradient over a linear one
        </span>
      </div>
      <div className={styles.layeredCard}>
        <div className={`${styles.layeredBox} ${styles.noiseTexture}`} {...noise.pointer} />
        <span className={styles.layeredLabel}>Noise texture</span>
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
        <span className={styles.layeredLabel}>Glass effect</span>
        <span className={styles.layeredDescription}>
          Backdrop blur over layered shapes
        </span>
      </div>
    </div>
  );
}
