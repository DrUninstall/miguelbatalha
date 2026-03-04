"use client";

import { SparklesButton } from "@/components/sparkles-button";
import { OutlineOrbitButton } from "@/components/outline-orbit-button";
import { HoldToDelete } from "@/components/hold-to-delete";
import { MorphingPill } from "@/components/morphing-pill";
import styles from "../[slug]/page.module.css";

export default function InteractiveButtons() {
  return (
    <div className={styles.prose}>
      <p>
        Buttons are the most clicked element on the web. Almost all of them feel like nothing — a color change on hover, a slight darkening on press. We settled on that interaction model around 2010 and never questioned it.
      </p>
      <p>
        Every click is a moment of intent. Someone decided to do something. The response should match that.
      </p>

      <h2 className={styles.sectionHeading}>Sparkles Button</h2>
      <p>
        Click — particles burst outward from the cursor. Hover — trailing sparkles follow the mouse across the surface. Each particle gets randomized position, rotation, scale, and color via Framer Motion&apos;s <code>AnimatePresence</code>.
      </p>
      <p>
        Only <code>transform</code> and <code>opacity</code> animate — no layout properties. Particles are absolutely positioned, so the button doesn&apos;t reflow. Burst direction comes from click coordinates, making each click feel unique.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click & hover</div>
        <div className={styles.demoInner}>
          <SparklesButton>Click for Sparkles</SparklesButton>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Outline Orbit Button</h2>
      <p>
        The outline is alive. SVG dashes orbit the border continuously — catches the eye without shouting. <code>stroke-dasharray</code> and <code>stroke-dashoffset</code> animation on an SVG <code>rect</code> matched to the button dimensions.
      </p>
      <p>
        Went with SVG over CSS <code>border-image</code> — precise control over dash length, gap size, rotation speed. Orbit speeds up on hover. Subtle, but you notice it.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Watch the border</div>
        <div className={styles.demoInner}>
          <OutlineOrbitButton />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Hold to Delete</h2>
      <p>
        Destructive actions deserve friction. Confirmation dialogs don&apos;t work — users click through without reading. This button makes you hold it down. A <code>clip-path</code> wipe fills left to right over 2 seconds. Release early — resets. All <code>clip-path</code>, all compositor.
      </p>
      <p>
        Cost proportional to effort. Quick tap — cheap. Two-second hold — you really want this.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Press and hold</div>
        <div className={styles.demoInner}>
          <HoldToDelete />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Morphing Pill</h2>
      <p>
        Apple&apos;s Dynamic Island, but in the browser. A pill that morphs between idle, call, timer, and music states — completely different dimensions and content each time, one smooth layout animation connecting them.
      </p>
      <p>
        Framer Motion&apos;s <code>layout</code> prop plus spring physics. Container animates dimensions, content cross-fades via <code>AnimatePresence</code>. Tuned the spring to feel bouncy but controlled — like the pill has actual mass.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Cycle through states</div>
        <div className={styles.demoInner}>
          <MorphingPill />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        None of these ship in a component library. That&apos;s the point. Libraries give you consistency — these give you moments. Small opportunities to make someone feel like the interface actually cares that they clicked.
      </p>
    </div>
  );
}
