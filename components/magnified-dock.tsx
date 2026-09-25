"use client";

import { useLayoutEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import {
  Globe,
  Mail,
  MessageSquare,
  Image,
  StickyNote,
  Calendar,
  Music,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "./magnified-dock.module.css";

// Base geometry at full size (px). The rendered sizes come from CSS
// (min(40px, 8cqi) etc., see the .dock rule), so the first paint is already
// right at every width. The magnification maths multiplies these by `unit`,
// which JS reads back from the rendered icon width.
const ICON = 40;
const GAP = 12;
const PAD = 8; // dock padding-left/right
const NUDGE = 40; // max sideways push for neighbours
const DISTANCE = 110; // radius of the magnification bell
const SCALE = 2.25; // peak scale under the pointer
const SPRING = { mass: 0.1, stiffness: 170, damping: 12 };

const APPS: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Safari", icon: Globe, color: "#007AFF" },
  { name: "Mail", icon: Mail, color: "#5856D6" },
  { name: "Messages", icon: MessageSquare, color: "#34C759" },
  { name: "Photos", icon: Image, color: "#FF9500" },
  { name: "Notes", icon: StickyNote, color: "#FFCC00" },
  { name: "Calendar", icon: Calendar, color: "#FF3B30" },
  { name: "Music", icon: Music, color: "#FF2D55" },
  { name: "Settings", icon: Settings, color: "#8E8E93" },
];

// Raised-cosine (Hann) bell: 1 at d = 0, falls smoothly to 0 at |d| = radius,
// with zero slope at both ends so there is no visible "edge" to the effect.
function bell(d: number, radius: number) {
  if (!Number.isFinite(d) || Math.abs(d) >= radius) return 0;
  return (1 + Math.cos((Math.PI * d) / radius)) / 2;
}

function DockIcon({
  app,
  index,
  unit,
  pointerX,
  reduceMotion,
}: {
  app: (typeof APPS)[number];
  index: number;
  unit: number;
  pointerX: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Icon centre from the (untransformed) layout, so no DOM reads are needed.
  const centre = PAD * unit + index * (ICON + GAP) * unit + (ICON * unit) / 2;
  const radius = DISTANCE * unit;
  const nudge = NUDGE * unit;

  // Signed distance from pointer to icon centre is pointerX - centre
  // (NaN while the dock is idle, which bell() maps to 0).
  const scale = useTransform(
    () => 1 + (SCALE - 1) * bell(pointerX.get() - centre, radius)
  );

  // Push away from the pointer: proportional to distance (times the icon's
  // current scale) inside the bell, a constant full nudge outside it, and
  // nothing while idle.
  const x = useTransform(() => {
    const d = pointerX.get() - centre;
    if (!Number.isFinite(d)) return 0;
    if (Math.abs(d) >= radius) return -Math.sign(d) * nudge;
    return (-d / radius) * nudge * (1 + (SCALE - 1) * bell(d, radius));
  });

  const scaleSpring = useSpring(scale, SPRING);
  const xSpring = useSpring(x, SPRING);
  const y = useMotionValue(0);

  const handleClick = () => {
    if (reduceMotion) return;
    animate(y, [0, -40 * unit, 0], {
      repeat: 2,
      ease: [
        [0, 0, 0.2, 1],
        [0.8, 0, 1, 1],
      ],
      duration: 0.7,
    });
  };

  // Keyboard focus magnifies as if the pointer were over this icon's centre.
  // Pointer-initiated focus (a click) is ignored so the dock doesn't jump.
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (e.currentTarget.matches(":focus-visible")) pointerX.set(centre);
  };

  const Icon = app.icon;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.button
          type="button"
          className={styles.appIcon}
          style={{ x: xSpring, scale: scaleSpring, y, backgroundColor: app.color }}
          onClick={handleClick}
          onFocus={handleFocus}
          aria-label={app.name}
        >
          {/* Sized to half the icon in CSS, so it scales with the dock. */}
          <Icon color="white" strokeWidth={2} aria-hidden />
        </motion.button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={styles.tooltip} sideOffset={10}>
          {app.name}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function MagnifiedDock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [unit, setUnit] = useState(1);
  const pointerX = useMotionValue(NaN); // pointer x relative to the dock, NaN = idle

  // CSS owns the size; the maths needs the same scale, so read it back from
  // the first icon's computed width (unaffected by its magnifying transform).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const icon = el.querySelector("button");
      if (!icon) return;
      const width = parseFloat(getComputedStyle(icon).width);
      if (width > 0) setUnit(width / ICON);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dockWidth = (APPS.length * ICON + (APPS.length - 1) * GAP + 2 * PAD) * unit;
  const nudge = NUDGE * unit;

  // The background grows on each side by up to `nudge` so the pushed-out end
  // icons stay on it. The left side only grows once the pointer is `nudge` px
  // in from the left edge (and vice versa), so an end icon under the pointer
  // (which is not pushed) doesn't get a gap beside it.
  const growLeft = useSpring(
    useTransform(() => {
      const p = pointerX.get();
      return Number.isFinite(p) ? Math.min(Math.max(p, 0), nudge) : 0;
    }),
    SPRING
  );
  const growRight = useSpring(
    useTransform(() => {
      const p = pointerX.get();
      return Number.isFinite(p) ? Math.min(Math.max(dockWidth - p, 0), nudge) : 0;
    }),
    SPRING
  );
  // Expressed as a transform instead of animating left/right: scaleX from the
  // centre, then shift by half the imbalance between the two sides.
  const bgScaleX = useTransform(
    () => (dockWidth + growLeft.get() + growRight.get()) / dockWidth
  );
  const bgX = useTransform(() => (growRight.get() - growLeft.get()) / 2);

  const setFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set(e.clientX - rect.left);
  };

  const reset = () => pointerX.set(NaN);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Mouse magnifies on hover; touch/pen only while pressed. Touch pointers
    // are implicitly captured by the icon they started on, so a finger that
    // slides along (or past) the dock keeps reporting moves here.
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    setFromPointer(e);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") reset();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) reset();
  };

  return (
    <Tooltip.Provider delayDuration={0}>
      <div ref={containerRef} className={styles.container}>
        <div
          className={styles.dock}
          onPointerDown={setFromPointer}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={reset}
          onPointerLeave={reset}
          onBlur={handleBlur}
        >
          <motion.div
            className={styles.dockBackground}
            style={{ scaleX: bgScaleX, x: bgX }}
          />
          {APPS.map((app, i) => (
            <DockIcon
              key={app.name}
              app={app}
              index={i}
              unit={unit}
              pointerX={pointerX}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
