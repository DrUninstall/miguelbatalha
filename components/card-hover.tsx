"use client";

import { useRef } from "react";
import styles from "./card-hover.module.css";

type Edge = "top" | "right" | "bottom" | "left";

// Where the overlay waits (off-card) before sliding in from / after sliding out to an edge.
const OFFSCREEN: Record<Edge, string> = {
  top: "translate3d(0, -100%, 0)",
  right: "translate3d(100%, 0, 0)",
  bottom: "translate3d(0, 100%, 0)",
  left: "translate3d(-100%, 0, 0)",
};
const SHOWN = "translate3d(0, 0, 0)";
const TRANSITION_MS = 300; // keep in sync with .overlay transition

// Which edge of `rect` is the point nearest to? For a point just outside the
// card (pointerleave) the crossed edge has a negative distance, so it still wins.
function nearestEdge(rect: DOMRect, clientX: number, clientY: number): Edge {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const distances: [Edge, number][] = [
    ["top", y],
    ["right", rect.width - x],
    ["bottom", rect.height - y],
    ["left", x],
  ];
  return distances.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}

interface CardHoverProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function CardHover({ title, subtitle, children }: CardHoverProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const hiddenAt = useRef(-Infinity);

  const show = (from: Edge) => {
    const el = overlayRef.current;
    if (!el || shown.current) return;
    shown.current = true;
    // If the overlay is fully parked off-card, teleport it (no transition) to
    // the entry edge first; otherwise it would sweep across from the old exit
    // edge. If it's still mid-exit, just reverse from where it is.
    if (performance.now() - hiddenAt.current > TRANSITION_MS) {
      el.style.transition = "none";
      el.style.transform = OFFSCREEN[from];
      void el.offsetWidth; // flush so the start position is committed
      el.style.transition = "";
    }
    el.style.transform = SHOWN;
  };

  const hide = (to: Edge) => {
    const el = overlayRef.current;
    if (!el || !shown.current) return;
    shown.current = false;
    hiddenAt.current = performance.now();
    el.style.transform = OFFSCREEN[to];
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // touch uses tap-to-toggle
    show(nearestEdge(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY));
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    hide(nearestEdge(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    if (shown.current) hide("bottom");
    else show("bottom");
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    // Only keyboard focus; a tap also focuses the card but is handled above.
    if (e.currentTarget.matches(":focus-visible")) show("bottom");
  };

  return (
    <div
      className={styles.card}
      tabIndex={0}
      role="group"
      aria-label={title}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onFocus={handleFocus}
      onBlur={() => hide("bottom")}
    >
      <div className={styles.artwork} aria-hidden>
        {children}
      </div>
      <span className={styles.label} aria-hidden>
        {title}
      </span>
      <div ref={overlayRef} className={styles.overlay}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
