"use client";

import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  variant?: "small" | "large";
  invalid?: boolean;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, variant = "small", invalid = false, optional = false, className = "", ...props }, ref) => {
    const inputClasses = [
      styles.input,
      styles[variant],
      Icon && styles.withIcon,
      invalid && styles.invalid,
      className
    ].filter(Boolean).join(" ");

    const iconClass = variant === "small" ? styles.icon : styles.iconLarge;

    return (
      <div className={styles.container}>
        {label && (
          <label className={`${styles.label} ${props.disabled ? styles.disabled : ""}`}>
            {label}
            {optional && <span className={styles.optional}>(optional)</span>}
            <AnimatePresence>
              {invalid && (
                <motion.span
                  className={styles.required}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  - Required
                </motion.span>
              )}
            </AnimatePresence>
          </label>
        )}

        <motion.div
          className={styles.inputWrapper}
          animate={invalid ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Icon && (
            <div className={`${styles.iconWrapper} ${props.disabled ? styles.disabled : ""}`}>
              <Icon className={iconClass} />
            </div>
          )}

          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </motion.div>
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  variant?: "small" | "large";
  invalid?: boolean;
  optional?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, variant = "small", invalid = false, optional = false, className = "", ...props }, ref) => {
    const textareaClasses = [
      styles.textarea,
      variant === "small" ? styles.textareaSmall : styles.textareaLarge,
      invalid && styles.invalid,
      className
    ].filter(Boolean).join(" ");

    return (
      <div className={styles.container}>
        {label && (
          <label className={`${styles.label} ${props.disabled ? styles.disabled : ""}`}>
            {label}
            {optional && <span className={styles.optional}>(optional)</span>}
            <AnimatePresence>
              {invalid && (
                <motion.span
                  className={styles.required}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  - Required
                </motion.span>
              )}
            </AnimatePresence>
          </label>
        )}

        <motion.div
          animate={invalid ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <textarea
            ref={ref}
            className={textareaClasses}
            {...props}
          />
        </motion.div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
