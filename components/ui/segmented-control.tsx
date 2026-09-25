"use client";

import { useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import styles from "./segmented-control.module.css";

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the radio group, e.g. "View mode". */
  "aria-label"?: string;
  size?: "small" | "normal";
  className?: string;
}

const THUMB_SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const INSTANT = { duration: 0 } as const;

/**
 * Arrow keys move the selection (radio group pattern): Right/Down go to the
 * next enabled option, Left/Up to the previous one, wrapping at the ends.
 */
function getArrowTarget(key: string, from: number, enabled: boolean[]): number | null {
  const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
  if (step === 0) return null;
  const count = enabled.length;
  for (let i = 1; i <= count; i++) {
    const next = (from + step * i + count) % count;
    if (enabled[next]) return next;
  }
  return null;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  size = "normal",
  className = "",
}: SegmentedControlProps) {
  // Unique per instance so two controls on one page never share a thumb.
  const thumbLayoutId = `segmented-thumb-${useId()}`;
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Keyboard changes snap; pointer changes glide.
  const [instant, setInstant] = useState(false);

  const enabled = options.map((option) => !option.disabled);
  const selectedIndex = options.findIndex((option) => option.value === value);
  // Roving tabindex: the selected option is the single tab stop (or the first
  // enabled one when nothing is selected).
  const tabStop = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.indexOf(true);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const target = getArrowTarget(event.key, index, enabled);
    if (target === null) return;
    event.preventDefault();
    setInstant(true);
    onChange(options[target].value);
    optionRefs.current[target]?.focus();
  };

  const containerClasses = [
    styles.container,
    size === "small" ? styles.small : styles.normal,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = index === selectedIndex;

        const optionClasses = [
          styles.option,
          isSelected ? styles.selected : styles.unselected,
          option.disabled && styles.disabled,
        ].filter(Boolean).join(" ");

        return (
          <button
            key={option.value}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={index === tabStop ? 0 : -1}
            disabled={option.disabled}
            className={optionClasses}
            onClick={() => {
              setInstant(false);
              onChange(option.value);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {isSelected && (
              // Rendered inside the selected option. When selection moves, the
              // new option mounts a thumb with the same layoutId and Framer
              // animates it from the old box to the new one with transforms.
              <motion.span
                layoutId={thumbLayoutId}
                className={styles.thumb}
                style={{ borderRadius: 6 }}
                transition={instant ? INSTANT : THUMB_SPRING}
                aria-hidden="true"
              />
            )}
            <span className={styles.content}>
              {Icon && <Icon className={styles.optionIcon} aria-hidden="true" />}
              <span>{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
