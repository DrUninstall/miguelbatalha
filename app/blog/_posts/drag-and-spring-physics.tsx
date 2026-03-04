"use client";

import { SwipeCarousel } from "@/components/swipe-carousel";
import { PasswordStrength } from "@/components/password-strength";
import { SignInDialog } from "@/components/sign-in-dialog";
import styles from "../[slug]/page.module.css";

export default function DragAndSpringPhysics() {
  return (
    <div className={styles.prose}>
      <p>
        Duration-based animation is a lie. When you set <code>transition: 0.3s ease</code>, you&apos;re telling every element to take exactly 300ms regardless of how far it travels or how fast the user interacted. Drag something 2 pixels and release — 300ms. Fling it across the screen — 300ms. The timing is disconnected from the input.
      </p>
      <p>
        Spring physics fixes this. A spring animation has no fixed duration — it resolves based on stiffness, damping, and the velocity at release. Fling harder, it goes further and takes longer. Nudge gently, it settles fast. The output matches the input. That&apos;s what &quot;feeling natural&quot; actually means.
      </p>

      <h2 className={styles.sectionHeading}>Swipe Carousel</h2>
      <p>
        A card carousel driven entirely by drag gestures. Each card is a Framer Motion <code>drag</code> element constrained to the x-axis. On release, the component reads the drag velocity and decides whether to snap to the next card or spring back to the current one.
      </p>
      <p>
        The velocity threshold is the key UX decision. Too low and casual touches trigger navigation. Too high and intentional swipes get rejected. I settled on 500px/s — fast enough that it feels deliberate, but not so fast that it requires a big fling. The snap animation uses a spring with moderate stiffness — it overshoots slightly, which paradoxically feels more responsive than a perfectly damped settle.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Drag to swipe</div>
        <div className={styles.demoInner}>
          <SwipeCarousel />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Password Strength</h2>
      <p>
        Real-time password validation with animated strength indicators. Each rule (length, uppercase, numbers, symbols) resolves independently — the strength bar is a sum of satisfied conditions, not a binary pass/fail.
      </p>
      <p>
        The animation part: the strength bar width transitions with a spring. When you type a character that satisfies a new rule, the bar springs forward with a small overshoot. Delete a character and break a rule, it springs back. The spring makes the bar feel like it&apos;s <em>reacting</em> to your input, not just recalculating.
      </p>
      <p>
        Each validation rule has its own checkmark animation — a small scale-and-fade that fires when the rule is first satisfied. These micro-confirmations reduce the cognitive load of reading a checklist. You feel progress without scanning.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Type a password</div>
        <div className={styles.demoInner}>
          <PasswordStrength />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Sign-In Dialog</h2>
      <p>
        A multi-step dialog that smoothly resizes between states — email input, password input, loading, success. Each step has different content height, and the dialog container animates its height using Framer Motion&apos;s <code>layout</code> prop.
      </p>
      <p>
        The tricky part is measuring content before rendering it. Framer Motion handles this with FLIP — it renders the new content, measures the size delta, then animates from old size to new. The content cross-fades while the container resizes, so you never see a jarring snap.
      </p>
      <p>
        I added spring physics to the height transition specifically to avoid the &quot;accordion&quot; feeling that linear height animations produce. The spring gives a slight bounce at the end — just enough to feel soft, not enough to feel playful. It&apos;s a dialog, after all.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Walk through the flow</div>
        <div className={styles.demoInner}>
          <SignInDialog />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        Spring physics aren&apos;t just a visual preference — they&apos;re a more accurate model of how things move in the physical world. Nothing in nature moves with a cubic-bezier curve and a fixed duration. Adopting springs means your animations respond to input proportionally, and that&apos;s what makes an interface feel like it has weight.
      </p>
    </div>
  );
}
