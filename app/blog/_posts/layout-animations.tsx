"use client";

import {
  SharedLayoutTabs,
  SharedLayoutSwap,
  SharedLayoutCard,
} from "@/components/shared-layout-demo";
import { CollectionPreview } from "@/components/collection-preview";
import styles from "../[slug]/page.module.css";

export default function LayoutAnimations() {
  return (
    <div className={styles.prose}>
      <p>
        The hard part of animation isn&apos;t making things move — it&apos;s making things move <em>between</em> states. Two completely different DOM layouts that need to feel like one continuous motion. Tab highlights. Card-to-dialog expansions. Grid rearrangements.
      </p>
      <p>
        Framer Motion&apos;s <code>layoutId</code> handles this with FLIP — First, Last, Invert, Play. Measure where the element is, measure where it ends up, calculate the delta, animate with <code>transform</code>. Compositor-only. Smooth.
      </p>

      <h2 className={styles.sectionHeading}>Tab Indicator</h2>
      <p>
        Simplest case: a highlight that follows the active tab. Without layout animation, you&apos;d calculate widths and offsets manually. With <code>layoutId</code>, render the highlight inside whichever tab is active — Framer Motion handles the rest.
      </p>
      <p>
        Spring config is everything here. Too stiff — mechanical. Too loose — overshoot and wobble. I landed on moderate stiffness with high damping. Snappy, no overshoot.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click tabs</div>
        <div className={styles.demoInner}>
          <SharedLayoutTabs />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Element Swap</h2>
      <p>
        When elements trade positions, the brain expects continuity. If item A disappears and reappears in item B&apos;s spot, it feels like teleportation. But if A visibly slides to B&apos;s position while B slides to A&apos;s — that&apos;s spatial consistency.
      </p>
      <p>
        Each item gets a <code>layoutId</code> tied to its identity, not its position in the array. When the array order changes, Framer Motion calculates the positional delta and animates each element to its new home. The items never leave the DOM — they just reflow.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Reorder elements</div>
        <div className={styles.demoInner}>
          <SharedLayoutSwap />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Card Expansion</h2>
      <p>
        This one genuinely surprised me. A card in a grid expands to fill the viewport as a dialog. Structurally — different components, different sizes, different content, different DOM positions. But they share a <code>layoutId</code>, so Framer Motion morphs one into the other.
      </p>
      <p>
        Overlay fades in with the expansion. Content cross-fades via <code>AnimatePresence</code>. Feels native — the kind of transition you expect on iOS, not the web.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click a card</div>
        <div className={styles.demoInner}>
          <SharedLayoutCard />
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Collection Preview</h2>
      <p>
        A stack of cards that fans out into a dock — like going from a notification summary to individual items. Each card has its own <code>layoutId</code>, so the transition from stacked to spread is one smooth motion per card. The stacking uses negative margins and <code>z-index</code> for the collapsed state, and evenly spaced flexbox for the expanded state.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Live Demo — Click to expand</div>
        <div className={styles.demoInner}>
          <CollectionPreview />
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        Before <code>layoutId</code>, I was writing manual FLIP code — measuring positions, calculating deltas, managing animation state. It worked, but it was brittle. The API now is almost embarrassingly simple: same <code>layoutId</code> on two elements and you&apos;re done. That&apos;s what a good abstraction looks like — you forget the hard problem ever existed.
      </p>
    </div>
  );
}
