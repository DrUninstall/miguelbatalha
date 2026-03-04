"use client";

import { OrbitAnimation } from "@/components/orbit-animation";
import { CoinFlip } from "@/components/coin-flip";
import { WillChangeDemo } from "@/components/will-change-demo";
import { TextReveal } from "@/components/text-reveal";
import styles from "../[slug]/page.module.css";

export default function MotionFoundations() {
  return (
    <div className={styles.prose}>
      <p>
        Most animation on the web is bad. Not because developers lack taste — but because they reach for the wrong CSS properties. Animate <code>width</code> and you trigger layout recalculation on every frame. Animate <code>background-color</code> and you force a repaint. The browser is doing ten times the work it needs to.
      </p>
      <p>
        The trick is simple: stick to <strong>transform</strong> and <strong>opacity</strong>. These two properties run on the compositor thread — the GPU handles them without touching the main thread. Everything else is a compromise.
      </p>
      <p>
        I built these four components to explore that constraint. Each one uses only compositor-friendly properties, and together they cover the fundamentals: rotation, 3D perspective, staged reveals, and GPU layer management.
      </p>

      <h2 className={styles.sectionHeading}>Orbiting Animation</h2>
      <p>
        Three concentric rings rotating at different speeds. The entire effect is just <code>transform: rotate()</code> on each ring — nothing else animates. The staggered speeds create a sense of depth without any actual 3D math. It&apos;s a good reminder that perceived complexity and actual complexity are different things.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <OrbitAnimation />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Coin Flip</h2>
      <p>
        CSS 3D transforms don&apos;t get enough credit. <code>rotateY(180deg)</code> with <code>backface-visibility: hidden</code> gives you a real two-sided object in the browser. The coin uses <code>perspective</code> on the parent to control the depth of the 3D effect — higher values flatten it, lower values exaggerate the rotation.
      </p>
      <p>
        The key insight: <code>transform-style: preserve-3d</code> on the coin container lets child elements maintain their own 3D positions rather than being flattened into 2D. Without it, you just get a weird scaling effect.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click to flip</div>
        <div className={styles.demoInner}>
          <CoinFlip />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Text Reveal</h2>
      <p>
        Staggered text animations feel premium when done right and annoying when done wrong. The difference is timing. Each character gets a tiny delay offset — small enough that the eye reads the word as a single motion, not individual letter bounces.
      </p>
      <p>
        The animation itself is just <code>translateY</code> and <code>opacity</code> — compositor-only. Framer Motion&apos;s <code>staggerChildren</code> handles the timing cascade. The whole thing runs at 60fps because there&apos;s nothing for the browser to paint or lay out.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Hover to reveal</div>
        <div className={styles.demoInner}>
          <TextReveal />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>The will-change Property</h2>
      <p>
        <code>will-change</code> is the most misunderstood CSS property. It tells the browser to promote an element to its own GPU layer <em>before</em> the animation starts, avoiding the jank of mid-animation layer creation. But layers cost memory — add it to everything and you&apos;ll run out of VRAM on mobile.
      </p>
      <p>
        The rule: apply <code>will-change</code> to elements you <em>know</em> will animate, remove it when they stop. This demo shows the performance difference side by side — the promoted element paints once and composites thereafter, while the unpromoted one repaints on every frame.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <WillChangeDemo />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        These components aren&apos;t flashy on their own. That&apos;s the point. The best animation infrastructure is invisible — it just makes everything feel right. Get the foundations locked in, and the complex stuff builds itself.
      </p>
    </div>
  );
}
