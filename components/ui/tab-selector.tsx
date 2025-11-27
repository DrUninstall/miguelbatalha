"use client";

import { useRef, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./tab-selector.module.css";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabSelector({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabSelectorProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateIndicatorPosition = () => {
    const activeButton = tabRefs.current.get(activeTab);
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  };

  useLayoutEffect(() => {
    updateIndicatorPosition();
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      role="tablist"
    >
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        const tabClasses = [
          styles.tab,
          isActive ? styles.active : styles.inactive,
          tab.disabled && styles.disabled
        ].filter(Boolean).join(" ");

        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.disabled}
            className={tabClasses}
            role="tab"
            aria-selected={isActive ? "true" : "false"}
            aria-controls={`panel-${tab.id}`}
            aria-disabled={tab.disabled ? "true" : "false"}
          >
            {tab.label}
          </button>
        );
      })}

      {/* Animated indicator */}
      <motion.div
        className={styles.indicator}
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />
    </div>
  );
}
