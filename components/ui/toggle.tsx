"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

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
    const sizeClasses = {
      small: {
        track: "w-9 h-5",
        thumb: "w-4 h-4",
        translate: "translate-x-4",
      },
      medium: {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-5",
      },
    };

    const { track, thumb, translate } = sizeClasses[size];

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {label && (
          <label
            className={`text-sm font-medium ${
              disabled ? "text-muted-foreground" : "text-foreground"
            }`}
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
          className={`
            relative inline-flex items-center rounded-full transition-all
            ${track}
            ${
              checked
                ? "bg-accent"
                : "bg-muted border border-border"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90 active:scale-95"}
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2
          `}
        >
          <motion.span
            className={`
              ${thumb}
              inline-block rounded-full
              ${checked ? "bg-accent-foreground" : "bg-foreground"}
              elevation-raised
            `}
            initial={false}
            animate={{
              x: checked ? translate : "0.125rem",
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
