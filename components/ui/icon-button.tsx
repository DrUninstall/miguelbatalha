"use client";

import React from "react";
import styles from "./icon-button.module.css";

export type IconButtonVariant = "primary" | "secondary" | "tertiary";
export type IconButtonTone = "brand" | "neutral" | "destructive" | "inverse";
export type IconButtonSize = "small" | "medium" | "large";

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-label"> {
  /** The icon. It is decorative; the button's name comes from aria-label. */
  children: React.ReactNode;
  /** Required: an icon-only button has no text, so this is its accessible name. */
  "aria-label": string;
  variant?: IconButtonVariant;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  htmlType?: "button" | "submit" | "reset";
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = "tertiary",
      tone = "neutral",
      size = "medium",
      htmlType = "button",
      className = "",
      ...rest
    },
    ref
  ) => {
    // e.g. "primaryBrand", "secondaryNeutral"
    const buttonClasses = [
      styles.iconButton,
      styles[size],
      styles[`${variant}${capitalize(tone)}`],
      className,
    ].filter(Boolean).join(" ");

    return (
      <button ref={ref} type={htmlType} className={buttonClasses} {...rest}>
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
