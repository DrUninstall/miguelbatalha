"use client";

import { forwardRef, useId } from "react";
import { motion } from "framer-motion";
import styles from "./toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label. Clicking it toggles the switch, and it names the switch. */
  label?: string;
  /** Accessible name when there is no visible label. */
  "aria-label"?: string;
  disabled?: boolean;
  size?: "small" | "medium";
  className?: string;
}

/** Thumb travel in px: track width - thumb width - 2px inset on each side. */
const THUMB_INSET = 2;
const THUMB_CHECKED_X = { small: 36 - 16 - THUMB_INSET, medium: 44 - 20 - THUMB_INSET };

const THUMB_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      onChange,
      label,
      "aria-label": ariaLabel,
      disabled = false,
      size = "medium",
      className = "",
    },
    ref
  ) => {
    const id = useId();
    const labelId = `${id}-label`;
    const trackSizeClass = size === "small" ? styles.trackSmall : styles.trackMedium;
    const thumbSizeClass = size === "small" ? styles.thumbSmall : styles.thumbMedium;

    return (
      <div className={`${styles.container} ${className}`}>
        {label && (
          // htmlFor on a <button> forwards label clicks to it, so the text is a
          // hit target; aria-labelledby makes it the switch's accessible name.
          <label
            id={labelId}
            htmlFor={id}
            className={`${styles.label} ${disabled ? styles.labelDisabled : ""}`}
          >
            {label}
          </label>
        )}

        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`${styles.track} ${trackSizeClass} ${
            checked ? styles.trackChecked : styles.trackUnchecked
          }`}
        >
          <motion.span
            className={`${styles.thumb} ${thumbSizeClass}`}
            initial={false}
            animate={{ x: checked ? THUMB_CHECKED_X[size] : THUMB_INSET }}
            transition={THUMB_SPRING}
          />
        </button>
      </div>
    );
  }
);

Toggle.displayName = "Toggle";
