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
        Buttons are the most clicked element on the web, and almost all of them feel like nothing. A color change on hover. A slight darkening on press. That&apos;s the interaction model we settled on in 2010 and never questioned.
      </p>
      <p>
        But buttons are the primary feedback mechanism between a person and your interface. Every click is a moment of intent — someone decided to do something. The response should match that energy.
      </p>

      <h2 className={styles.sectionHeading}>Sparkles Button</h2>
      <p>
        On click, a burst of particles explodes outward from the cursor position. On hover, trailing sparkles follow the mouse across the button surface. Each particle is a small element animated with randomized position, rotation, scale, and color using Framer Motion&apos;s <code>AnimatePresence</code>.
      </p>
      <p>
        The particles use <code>transform</code> and <code>opacity</code> exclusively — no layout properties animate. They&apos;re absolutely positioned relative to the button, so the button itself doesn&apos;t reflow. The burst direction is calculated from the click coordinates, giving each click a unique spray pattern.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click & hover</div>
        <div className={styles.demoInner}>
          <SparklesButton>Click for Sparkles</SparklesButton>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Outline Orbit Button</h2>
      <p>
        A button where the outline itself is alive. SVG dashes orbit the border continuously — it catches the eye without shouting. The effect uses <code>stroke-dasharray</code> and <code>stroke-dashoffset</code> animation on an SVG <code>rect</code> that matches the button&apos;s dimensions.
      </p>
      <p>
        I chose SVG over CSS <code>border-image</code> because SVG gives precise control over dash length, gap size, and rotation speed. The orbit speed increases on hover as a subtle acknowledgment of attention.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Watch the border</div>
        <div className={styles.demoInner}>
          <OutlineOrbitButton />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Hold to Delete</h2>
      <p>
        Destructive actions deserve friction. Instead of a confirmation dialog — which users click through without reading — this button requires you to hold it down. A <code>clip-path</code> wipe fills the button from left to right over 2 seconds. Release early and it resets. The animation is entirely <code>clip-path</code> based — S-Tier compositor performance.
      </p>
      <p>
        This pattern works because the cost of the action is proportional to the effort required. A quick tap is cheap — a 2-second hold means you really want this.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Press and hold</div>
        <div className={styles.demoInner}>
          <HoldToDelete />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Morphing Pill</h2>
      <p>
        Inspired by Apple&apos;s Dynamic Island — a pill-shaped container that morphs between different states: idle, incoming call, timer, music player. Each state has completely different dimensions and content, but the transition between them is one smooth layout animation.
      </p>
      <p>
        The trick is Framer Motion&apos;s <code>layout</code> prop combined with spring physics. The container animates its dimensions while the content cross-fades with <code>AnimatePresence</code>. The spring config is tuned to feel bouncy but controlled — like the pill is made of something physical.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Cycle through states</div>
        <div className={styles.demoInner}>
          <MorphingPill />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        None of these are standard. That&apos;s intentional. A button library gives you consistency. These give you moments — small opportunities to make someone feel like the interface is paying attention.
      </p>
    </div>
  );
}
