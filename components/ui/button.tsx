import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonTone = "brand" | "neutral" | "destructive";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Turns off the press scale, for dense rows of buttons. */
  still?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      tone = "neutral",
      size = "medium",
      still = false,
      type = "button",
      className,
      ...rest
    },
    ref
  ) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[tone],
      styles[size],
      !still && styles.pressable,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={classes} {...rest} />;
  }
);

Button.displayName = "Button";
