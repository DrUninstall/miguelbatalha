"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import styles from "./toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium";
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      onChange,
      label,
      disabled = false,
      size = "medium",
      className = "",
    },
    ref
  ) => {
    const trackSizeClass = size === "small" ? styles.trackSmall : styles.trackMedium;
    const thumbSizeClass = size === "small" ? styles.thumbSmall : styles.thumbMedium;
    const translateX = size === "small" ? 16 : 20;

    return (
      <div className={`${styles.container} ${className}`}>
        {label && (
          <label
            className={`${styles.label} ${disabled ? styles.labelDisabled : ""}`}
          >
            {label}
          </label>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`${styles.track} ${trackSizeClass} ${
            checked ? styles.trackChecked : styles.trackUnchecked
          }`}
        >
          <motion.span
            className={`${styles.thumb} ${thumbSizeClass} ${
              checked ? styles.thumbChecked : styles.thumbUnchecked
            }`}
            initial={false}
            animate={{
              x: checked ? translateX : 2,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        </button>
      </div>
    );
  }
);

Toggle.displayName = "Toggle";
