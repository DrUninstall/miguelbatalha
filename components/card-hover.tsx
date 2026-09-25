"use client";

import { useRef } from "react";
import styles from "./card-hover.module.css";

type Edge = "top" | "right" | "bottom" | "left";
type Point = { x: number; y: number };

// Where the overlay waits (off-card) before sliding in from / after sliding out to an edge.
const OFFSCREEN: Record<Edge, string> = {
  top: "translate3d(0, -100%, 0)",
  right: "translate3d(100%, 0, 0)",
  bottom: "translate3d(0, 100%, 0)",
  left: "translate3d(-100%, 0, 0)",
};
const SHOWN = "translate3d(0, 0, 0)";

// The edge nearest to a point. A fallback for when there is no direction of travel.
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

// Follow a ray from a point inside `rect` in direction (dx, dy): which edge
// does it leave through? Each edge is some distance away along the ray, and
// the ray hits the nearest one first.
function edgeAlong(rect: DOMRect, from: Point, dx: number, dy: number): Edge {
  const x = from.x - rect.left;
  const y = from.y - rect.top;
  const hits: [Edge, number][] = [];
  if (dy < 0) hits.push(["top", y / -dy]);
  if (dx > 0) hits.push(["right", (rect.width - x) / dx]);
  if (dy > 0) hits.push(["bottom", (rect.height - y) / dy]);
  if (dx < 0) hits.push(["left", x / -dx]);
  if (hits.length === 0) return nearestEdge(rect, from.x, from.y);
  return hits.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}

interface CardHoverProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function CardHover({ title, subtitle, children }: CardHoverProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  // Set by pointerenter, cleared by the pointermove that follows it.
  const entering = useRef(false);
  // The last pointer position seen inside the card, to tell which way it left.
  const lastInside = useRef<Point | null>(null);

  const show = (from: Edge) => {
    const el = overlayRef.current;
    if (!el || shown.current) return;
    shown.current = true;
    // Parked off-card (no transition running): jump it, transitions off, to the
    // entry edge first, or it would sweep across from the old exit edge.
    // Still mid-exit: just reverse from where it is.
    if (el.getAnimations().length === 0) {
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
    el.style.transform = OFFSCREEN[to];
  };

  // pointerenter carries no movement (movementX/Y are 0 on boundary events), so
  // the edge is decided by the pointermove the browser sends straight after it:
  // step back from the entry point along the direction of travel.
  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // touch uses tap-to-toggle
    entering.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const point = { x: e.clientX, y: e.clientY };
    if (entering.current) {
      entering.current = false;
      show(edgeAlong(e.currentTarget.getBoundingClientRect(), point, -e.movementX, -e.movementY));
    }
    lastInside.current = point;
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    entering.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    const last = lastInside.current;
    lastInside.current = null;
    hide(
      last
        ? edgeAlong(rect, last, e.clientX - last.x, e.clientY - last.y)
        : nearestEdge(rect, e.clientX, e.clientY)
    );
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
      onPointerMove={handlePointerMove}
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
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
