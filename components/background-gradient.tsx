"use client";

/**
 * Global animated background gradient
 *
 * Uses position: fixed to stay viewport-relative and extend beyond edges.
 * S-Tier animation (transform + filter) for smooth 60fps performance.
 *
 * The gradient is purposefully oversized (150vmax) so edges are never
 * visible regardless of viewport size or aspect ratio.
 */
export function BackgroundGradient() {
  return (
    <div
      className="background-gradient"
      aria-hidden="true"
    />
  );
}
