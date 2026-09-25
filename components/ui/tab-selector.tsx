"use client";

import { useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./tab-selector.module.css";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
  /** id of the tabpanel this tab controls. Only then is aria-controls set. */
  panelId?: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** id of the tablist. Each tab's id is derived from it with `getTabId`. */
  id?: string;
  /** Accessible name for the tablist. */
  "aria-label"?: string;
  className?: string;
}

/** The id TabSelector gives a tab, for a tabpanel's aria-labelledby. */
export function getTabId(tablistId: string, tabId: string) {
  return `${tablistId}-tab-${tabId}`;
}

// stiffness 400, damping 40 → damping ratio 40 / (2·√400) = 1: critically
// damped, so the underline lands on the tab without overshooting it.
const INDICATOR_SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;
// Keyboard moves are frequent and already give focus feedback, so they snap.
const INSTANT = { duration: 0 } as const;

/**
 * Keyboard target for a horizontal tablist: Left/Right move to the
 * previous/next enabled tab (wrapping), Home/End jump to the first/last.
 */
function getKeyTarget(key: string, from: number, enabled: boolean[]): number | null {
  const count = enabled.length;
  if (key === "Home") return enabled.indexOf(true);
  if (key === "End") return enabled.lastIndexOf(true);
  const step = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
  if (step === 0) return null;
  for (let i = 1; i <= count; i++) {
    const next = (from + step * i + count) % count;
    if (enabled[next]) return next;
  }
  return null;
}

export function TabSelector({
  tabs,
  activeTab,
  onTabChange,
  id,
  "aria-label": ariaLabel,
  className = "",
}: TabSelectorProps) {
  const generatedId = useId();
  const tablistId = id ?? generatedId;
  // Unique per instance so two tab bars on one page never share an indicator.
  const indicatorLayoutId = `tab-indicator-${tablistId}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [viaKeyboard, setViaKeyboard] = useState(false);

  const enabled = tabs.map((tab) => !tab.disabled);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  // Roving tabindex: only the active tab is in the page's tab order.
  const tabStop = activeIndex >= 0 && enabled[activeIndex] ? activeIndex : enabled.indexOf(true);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const target = getKeyTarget(event.key, index, enabled);
    if (target === null || target === -1) return;
    event.preventDefault();
    setViaKeyboard(true);
    // Automatic activation: moving focus also selects the tab.
    onTabChange(tabs[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <div id={tablistId} className={`${styles.container} ${className}`} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;

        const tabClasses = [
          styles.tab,
          isActive ? styles.active : styles.inactive,
          tab.disabled && styles.disabled,
        ].filter(Boolean).join(" ");

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={getTabId(tablistId, tab.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tab.panelId}
            tabIndex={index === tabStop ? 0 : -1}
            disabled={tab.disabled}
            className={tabClasses}
            onClick={() => {
              setViaKeyboard(false);
              onTabChange(tab.id);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {isActive && (
              // Same layoutId in whichever tab is active: Framer animates the
              // bar from the previous tab's box to this one with transforms.
              <motion.span
                layoutId={indicatorLayoutId}
                className={styles.indicator}
                transition={viaKeyboard ? INSTANT : INDICATOR_SPRING}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
