"use client";

import { MouseFollowPattern } from "@/components/mouse-follow-pattern";
import { MagnifiedDock } from "@/components/magnified-dock";
import { CardHover } from "@/components/card-hover";
import { Marquee } from "@/components/marquee";
import styles from "../[slug]/page.module.css";

export default function CursorInteractions() {
  return (
    <div className={styles.prose}>
      <p>
        Touch interfaces killed the hover state. For good reason — there&apos;s no hover on a phone. But on desktop, the cursor is always there, always broadcasting position, always available for interaction. Ignoring it means ignoring the most information-rich input channel you have.
      </p>
      <p>
        These four components treat the cursor as a first-class input — not just a binary hover/no-hover, but a continuous stream of position, velocity, and proximity data.
      </p>

      <h2 className={styles.sectionHeading}>Mouse Follow Pattern</h2>
      <p>
        A grid of elements that react to cursor proximity. Each cell calculates its distance from the pointer and adjusts its rotation and scale accordingly. The math is straightforward — <code>atan2</code> for rotation angle, inverse distance for intensity — but the visual result is surprisingly organic.
      </p>
      <p>
        Performance is the challenge here. With 100+ elements recalculating on every mouse move, you need to be intentional about what triggers renders. Spring animations on each element absorb the jank — even if the position updates are slightly delayed, the springs smooth everything out.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Move your cursor</div>
        <div className={styles.demoInner}>
          <MouseFollowPattern />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Magnified Dock</h2>
      <p>
        Direct reference to the macOS dock magnification. The math: each icon calculates its distance from the cursor along the x-axis, then maps that distance to a scale value through a bell curve (gaussian falloff). Icons closest to the cursor scale up the most, neighbors scale up less, and distant icons stay at base size.
      </p>
      <p>
        The trick that makes it feel right: the magnification affects spacing, not just scale. When an icon grows, its neighbors shift outward to make room. Without this, icons overlap. The dock uses flexbox with <code>gap</code> calculated from each icon&apos;s current scale — a clean solution that avoids manual position math.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Hover across the dock</div>
        <div className={styles.demoInner}>
          <MagnifiedDock />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Card Hover</h2>
      <p>
        A card that reveals hidden content on hover — not with a simple show/hide, but with a directional reveal that follows the cursor entry point. The reveal direction is calculated from which edge the cursor crossed: enter from the left, content slides in from the left.
      </p>
      <p>
        This is one of those small details that most users won&apos;t consciously notice but will feel. Directional awareness makes the hover feel physical — like you&apos;re lifting a flap rather than toggling a switch.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Hover over the card</div>
        <div className={styles.demoInner}>
          <CardHover />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Marquee</h2>
      <p>
        The infinite scroll ticker — a pattern as old as HTML, now done with pure CSS. The trick is duplicating the content and translating it by exactly its width in a loop. When the first copy scrolls off-screen, the second copy has taken its place seamlessly. No JavaScript interval, no position tracking.
      </p>
      <p>
        I added a subtle cursor interaction: hovering pauses the scroll. It&apos;s a small accessibility win — continuous motion can be disorienting, and giving users a way to stop it (without a button) respects their attention.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Hover to pause</div>
        <div className={styles.demoInner}>
          <Marquee />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        Desktop web has a superpower that mobile doesn&apos;t — a persistent, precise pointer that broadcasts its position 60 times a second. Building interactions that acknowledge the cursor makes interfaces feel alive in a way that static hover states never will.
      </p>
    </div>
  );
}
