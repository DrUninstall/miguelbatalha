"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./button.module.css";

export type ButtonType = "primary" | "secondary" | "tertiary";
export type ButtonTone = "brand" | "neutral" | "destructive" | "inverse";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  children: React.ReactNode | (() => React.ReactNode);
  variant?: ButtonType;
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: React.ReactNode | (() => React.ReactNode);
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  htmlType?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      tone = "neutral",
      size = "medium",
      icon,
      iconPosition = "left",
      fullWidth = false,
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
      styles.button,
      styles[size],
      styles[variantClass],
      fullWidth && styles.fullWidth,
      className
    ].filter(Boolean).join(" ");

    const iconClass = [
      styles.icon,
      styles[`icon${size.charAt(0).toUpperCase()}${size.slice(1)}`]
    ].join(" ");

    const renderContent = (content: React.ReactNode | (() => React.ReactNode)) => {
      return typeof content === "function" ? content() : content;
    };

    return (
      <motion.button
        ref={ref}
        type={htmlType as "button" | "submit" | "reset"}
        className={buttonClasses}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...(rest as any)}
      >
        {icon && iconPosition === "left" && (
          <span className={iconClass} aria-hidden="true">
            {renderContent(icon)}
          </span>
        )}

        <span className={styles.label}>
          {renderContent(children)}
        </span>

        {icon && iconPosition === "right" && (
          <span className={iconClass} aria-hidden="true">
            {renderContent(icon)}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
