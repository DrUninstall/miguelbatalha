"use client";

import { useState } from "react";
import { ThemeToggle, ThemeToggleExpanded } from "@/components/theme-toggle";
import { Toaster, useToast } from "@/components/toast";
import { PaginatedList } from "@/components/ui/paginated-list";
import { SimpleList, List } from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import styles from "../[slug]/page.module.css";

function ToastDemo() {
  const toast = useToast();

  return (
    <div className={styles.demoRow}>
      <Button
        variant="primary"
        size="small"
        onClick={() => toast.success("Changes saved successfully")}
      >
        Success Toast
      </Button>
      <Button
        variant="secondary"
        size="small"
        onClick={() => toast.error("Something went wrong")}
      >
        Error Toast
      </Button>
      <Button
        variant="tertiary"
        size="small"
        onClick={() => toast.info("New version available")}
      >
        Info Toast
      </Button>
    </div>
  );
}

export default function ThemingAndPolish() {
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }));

  return (
    <Toaster>
      <div className={styles.prose}>
        <p>
          The last 10% of polish takes 90% of the effort. Everyone knows this. Few people do it anyway. Dark mode, toast notifications, virtualized lists, accessible keyboard navigation — none of these are the feature. They&apos;re the difference between &quot;it works&quot; and &quot;it feels finished.&quot;
        </p>

        <h2 className={styles.sectionHeading}>Theme Toggle</h2>
        <p>
          Dark mode isn&apos;t just inverting colors. It&apos;s a separate set of semantic tokens — <code>--text-strong</code> maps to near-white in dark mode but near-black in light mode. The background palette shifts from pure white/grey-50 to grey-900/grey-850. Shadows get heavier (darker mode needs more shadow contrast). Brand colors shift to lighter tints for legibility against dark backgrounds.
        </p>
        <p>
          The toggle itself uses a <strong>view transition</strong> — the new theme expands from the click point using a <code>clip-path: circle()</code> animation. It&apos;s a S-tier compositor animation (clip-path runs on the GPU) that makes theme switching feel spatial rather than instantaneous. You see <em>where</em> the new theme came from.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoLabel}>Theme Toggle — Click to switch</div>
          <div className={styles.demoRow}>
            <ThemeToggle />
            <ThemeToggleExpanded />
          </div>
        </div>

        <h2 className={styles.sectionHeading}>Toast Notifications</h2>
        <p>
          Toasts are the default feedback mechanism for async actions. Save a document — toast. API call fails — toast. New message arrives — toast. The pattern is so common that most people use a library and never think about it.
        </p>
        <p>
          I built a custom system because I wanted control over three things: <strong>entry animation</strong> (slide up from bottom with spring physics), <strong>stacking behavior</strong> (newer toasts push older ones up, with scale reduction for depth), and <strong>auto-dismiss timing</strong> (3 seconds for success, 5 for errors, persistent for actions that need acknowledgment).
        </p>
        <p>
          The toast container uses <code>position: fixed</code> at the bottom of the viewport. Each toast gets <code>AnimatePresence</code> for enter/exit animations and a progress bar for the auto-dismiss countdown. The bar uses <code>scaleX</code> — compositor-only.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoLabel}>Toast Notifications — Click to trigger</div>
          <ToastDemo />
        </div>

        <h2 className={styles.sectionHeading}>Paginated List</h2>
        <p>
          For moderate datasets (50-500 items), pagination is still the most practical pattern. This component shows 10 items per page with navigation controls. The page transition uses a subtle fade — just enough to signal that the content changed, not so much that it feels like a page load.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoLabel}>Paginated List</div>
          <div className={styles.listContainer}>
            <PaginatedList items={items} />
          </div>
        </div>

        <h2 className={styles.sectionHeading}>Virtualized List</h2>
        <p>
          For large datasets, rendering every item is wasteful. Virtualization renders only the items visible in the viewport plus a small overscan buffer. Scroll down and items render just-in-time. Scroll up and they unmount.
        </p>
        <p>
          The implementation uses a fixed-height container with absolute positioning. Each item&apos;s <code>top</code> offset is calculated from its index times the row height. A scroll listener determines which items are visible and only those get rendered. The DOM stays small regardless of list length — 10,000 items and 50 items have the same rendering cost.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoLabel}>Virtualized Scrollable List</div>
          <div className={styles.listContainer}>
            <List items={items} />
          </div>
        </div>

        <hr className={styles.separator} />

        <p>
          Polish isn&apos;t a phase — it&apos;s a standard. Every component in this system has accessible focus states, keyboard navigation, dark mode support, and considered animation. Not because users asked for these things specifically, but because their absence is what makes software feel unfinished. The details are the product.
        </p>
      </div>
    </Toaster>
  );
}
