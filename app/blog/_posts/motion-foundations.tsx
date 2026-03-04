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
        Most animation on the web is bad. Not a taste problem — a property problem. Animate <code>width</code> and you trigger layout recalculation on every frame. Animate <code>background-color</code> and you force a repaint. The browser does ten times the work it needs to.
      </p>
      <p>
        The fix: <strong>transform</strong> and <strong>opacity</strong>. That&apos;s it. These two run on the compositor thread — GPU handles them, main thread stays free. Everything else is a compromise you should make deliberately, not accidentally.
      </p>
      <p>
        I built four components around that constraint. Rotation, 3D perspective, staged reveals, GPU layer management. Each one compositor-only.
      </p>

      <h2 className={styles.sectionHeading}>Orbiting Animation</h2>
      <p>
        Three concentric rings rotating at different speeds. The entire effect is <code>transform: rotate()</code> on each ring — nothing else animates. Staggered speeds create depth without 3D math. Perceived complexity and actual complexity are different things.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <OrbitAnimation />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Coin Flip</h2>
      <p>
        CSS 3D transforms are underrated. <code>rotateY(180deg)</code> plus <code>backface-visibility: hidden</code> gives you a real two-sided object in the browser. <code>perspective</code> on the parent controls depth — higher values flatten, lower values exaggerate.
      </p>
      <p>
        The thing that tripped me up initially: you need <code>transform-style: preserve-3d</code> on the container. Without it, children get flattened into 2D and you just see a weird scale effect instead of an actual flip.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click to flip</div>
        <div className={styles.demoInner}>
          <CoinFlip />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Text Reveal</h2>
      <p>
        Staggered text animations — premium when done right, annoying when done wrong. The difference is timing. Each character gets a tiny delay offset, small enough that the eye reads the word as one motion instead of individual letter bounces.
      </p>
      <p>
        Just <code>translateY</code> and <code>opacity</code> — compositor-only. Framer Motion&apos;s <code>staggerChildren</code> handles the cascade. 60fps with zero paint or layout work.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Hover to reveal</div>
        <div className={styles.demoInner}>
          <TextReveal />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>The will-change Property</h2>
      <p>
        <code>will-change</code> is the most misunderstood CSS property. It promotes an element to its own GPU layer <em>before</em> animation starts — avoids the jank of mid-animation layer creation. But layers cost VRAM. Slap it on everything and mobile devices choke.
      </p>
      <p>
        My rule: apply it to elements you <em>know</em> will animate, remove it when they stop. This demo shows the difference — promoted element paints once and composites after, unpromoted one repaints every frame.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo</div>
        <div className={styles.demoInner}>
          <WillChangeDemo />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        None of these are flashy on their own. That&apos;s the point. Good animation infrastructure is invisible — you just notice when it&apos;s missing. I keep coming back to the same lesson: get the GPU fundamentals right first, and the complex stuff mostly builds itself.
      </p>
    </div>
  );
}
