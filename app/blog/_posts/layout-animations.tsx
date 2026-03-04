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
        The hardest animation problem in UI isn&apos;t making things move. It&apos;s making things move <em>between</em> states — two completely different DOM layouts that need to feel like one continuous motion. A tab highlight sliding from one label to another. A card expanding into a full dialog. A grid rearranging its items.
      </p>
      <p>
        Framer Motion&apos;s <code>layoutId</code> solves this with FLIP animations — First, Last, Invert, Play. The browser measures where the element is now (First), then where it ends up (Last), calculates the difference (Invert), and animates using only <code>transform</code> (Play). All compositor-friendly. All smooth.
      </p>

      <h2 className={styles.sectionHeading}>Tab Indicator</h2>
      <p>
        The simplest case: a highlight that follows the active tab. Without layout animation, you&apos;d calculate widths and offsets manually. With <code>layoutId</code>, you just render the highlight inside whichever tab is active — Framer Motion figures out the transition automatically.
      </p>
      <p>
        The spring config matters here. Too stiff and it feels mechanical. Too loose and it overshoots and wobbles. I settled on moderate stiffness with high damping — snappy but no overshoot.
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
        This is the one that feels like magic. A card in a grid expands to fill the viewport as a dialog. Structurally, the card and the dialog are completely different components — different sizes, different content, different DOM positions. But because they share a <code>layoutId</code>, Framer Motion morphs one into the other.
      </p>
      <p>
        The overlay fades in simultaneously with the card expansion. The content inside cross-fades using <code>AnimatePresence</code>. The whole interaction feels native — like something you&apos;d see in iOS, not a web app.
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
        Layout animations are the closest the web gets to native app transitions. The API is deceptively simple — just give two elements the same <code>layoutId</code> — but the results feel like you spent weeks on custom animation code. That&apos;s the whole point of good abstractions.
      </p>
    </div>
  );
}
