"use client";

import React from "react";
import styles from "./button.module.css";

export type ButtonType = "primary" | "secondary" | "tertiary";
export type ButtonTone = "brand" | "neutral" | "destructive" | "inverse";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  children: React.ReactNode | (() => React.ReactNode);
  variant?: ButtonType;
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: React.ReactNode | (() => React.ReactNode);
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  htmlType?: "button" | "submit" | "reset";
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const renderContent = (content: React.ReactNode | (() => React.ReactNode)) =>
  typeof content === "function" ? content() : content;

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
      ...rest
    },
    ref
  ) => {
    // e.g. "primaryBrand", "secondaryNeutral"
    const buttonClasses = [
      styles.button,
      styles[size],
      styles[`${variant}${capitalize(tone)}`],
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(" ");

    const iconClass = `${styles.icon} ${styles[`icon${capitalize(size)}`]}`;

    return (
      <button ref={ref} type={htmlType} className={buttonClasses} {...rest}>
        {icon && iconPosition === "left" && (
          <span className={iconClass} aria-hidden="true">
            {renderContent(icon)}
          </span>
        )}

        <span className={styles.label}>{renderContent(children)}</span>

        {icon && iconPosition === "right" && (
          <span className={iconClass} aria-hidden="true">
            {renderContent(icon)}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
