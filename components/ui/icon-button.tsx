"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./icon-button.module.css";

export type IconButtonVariant = "primary" | "secondary" | "tertiary";
export type IconButtonTone = "brand" | "neutral" | "destructive" | "inverse";
export type IconButtonSize = "small" | "medium" | "large";

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: React.ReactNode;
  variant?: IconButtonVariant;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  htmlType?: "button" | "submit" | "reset";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = "tertiary",
      tone = "neutral",
      size = "medium",
      htmlType = "button",
      className = "",
      disabled,
      ...rest
    },
    ref
  ) => {
    // Build variant class name (e.g., "primaryBrand", "secondaryNeutral")
    const variantClass = `${variant}${tone.charAt(0).toUpperCase()}${tone.slice(1)}`;

    // Combine all CSS module classes
    const buttonClasses = [
      styles.iconButton,
      styles[size],
      styles[variantClass],
      className
    ].filter(Boolean).join(" ");

    return (
      <motion.button
        ref={ref}
        type={htmlType as "button" | "submit" | "reset"}
        className={buttonClasses}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.1 }}
        whileTap={disabled ? {} : { scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...(rest as any)}
      >
        {children}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
