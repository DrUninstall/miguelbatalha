"use client";

import { useId, useRef } from "react";
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
  /** Accessible name for the tablist. */
  "aria-label"?: string;
  className?: string;
}

const INDICATOR_SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

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
  "aria-label": ariaLabel,
  className = "",
}: TabSelectorProps) {
  // Unique per instance so two tab bars on one page never share an indicator.
  const indicatorLayoutId = `tab-indicator-${useId()}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabled = tabs.map((tab) => !tab.disabled);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  // Roving tabindex: only the active tab is in the page's tab order.
  const tabStop = activeIndex >= 0 && enabled[activeIndex] ? activeIndex : enabled.indexOf(true);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const target = getKeyTarget(event.key, index, enabled);
    if (target === null || target === -1) return;
    event.preventDefault();
    // Automatic activation: moving focus also selects the tab.
    onTabChange(tabs[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <div className={`${styles.container} ${className}`} role="tablist" aria-label={ariaLabel}>
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
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tab.panelId}
            tabIndex={index === tabStop ? 0 : -1}
            disabled={tab.disabled}
            className={tabClasses}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {isActive && (
              // Same layoutId in whichever tab is active: Framer animates the
              // bar from the previous tab's box to this one with transforms.
              <motion.span
                layoutId={indicatorLayoutId}
                className={styles.indicator}
                transition={INDICATOR_SPRING}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
