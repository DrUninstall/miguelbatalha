"use client";

import { forwardRef, useId } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./input.module.css";

interface FieldProps {
  /** Visible label, associated with the field via htmlFor/id. */
  label?: string;
  variant?: "small" | "large";
  /** Marks the field invalid (red ring, aria-invalid, shake). Implied by `error`. */
  invalid?: boolean;
  /** Error message rendered below the field and linked with aria-describedby. */
  error?: string;
  optional?: boolean;
}

/** Horizontal shake keyframes in px, played once when the field turns invalid. */
const SHAKE = [0, -8, 8, -6, 6, 0];
const SHAKE_TRANSITION = { duration: 0.4, ease: "easeInOut" } as const;

/**
 * Shared wiring for Input and TextArea: a stable id for label association,
 * an id for the error message, and the merged aria-describedby value.
 */
function useFieldIds(id: string | undefined, error: string | undefined, describedBy: string | undefined) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const ariaDescribedBy = [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  return { fieldId, errorId, ariaDescribedBy };
}

function FieldLabel({ htmlFor, label, optional, disabled }: { htmlFor: string; label: string; optional: boolean; disabled?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={`${styles.label} ${disabled ? styles.disabled : ""}`}>
      {label}
      {optional && <span className={styles.optional}>(optional)</span>}
    </label>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className={styles.error}>
      {error}
    </p>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: Icon,
      variant = "small",
      invalid = false,
      error,
      optional = false,
      className = "",
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref
  ) => {
    const { fieldId, errorId, ariaDescribedBy } = useFieldIds(id, error, describedBy);
    const isInvalid = invalid || Boolean(error);
    const shouldReduceMotion = useReducedMotion();

    const inputClasses = [
      styles.input,
      styles[variant],
      Icon && styles.withIcon,
      isInvalid && styles.invalid,
      className,
    ].filter(Boolean).join(" ");

    const iconClass = variant === "small" ? styles.icon : styles.iconLarge;

    return (
      <div className={styles.container}>
        {label && <FieldLabel htmlFor={fieldId} label={label} optional={optional} disabled={props.disabled} />}

        <motion.div
          className={styles.inputWrapper}
          initial={false}
          animate={isInvalid && !shouldReduceMotion ? { x: SHAKE } : { x: 0 }}
          transition={SHAKE_TRANSITION}
        >
          {Icon && (
            <div className={`${styles.iconWrapper} ${props.disabled ? styles.disabled : ""}`}>
              <Icon className={iconClass} aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={fieldId}
            className={inputClasses}
            aria-invalid={isInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            {...props}
          />
        </motion.div>

        <FieldError id={errorId} error={error} />
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      variant = "small",
      invalid = false,
      error,
      optional = false,
      className = "",
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref
  ) => {
    const { fieldId, errorId, ariaDescribedBy } = useFieldIds(id, error, describedBy);
    const isInvalid = invalid || Boolean(error);
    const shouldReduceMotion = useReducedMotion();

    const textareaClasses = [
      styles.textarea,
      variant === "small" ? styles.textareaSmall : styles.textareaLarge,
      isInvalid && styles.invalid,
      className,
    ].filter(Boolean).join(" ");

    return (
      <div className={styles.container}>
        {label && <FieldLabel htmlFor={fieldId} label={label} optional={optional} disabled={props.disabled} />}

        <motion.div
          initial={false}
          animate={isInvalid && !shouldReduceMotion ? { x: SHAKE } : { x: 0 }}
          transition={SHAKE_TRANSITION}
        >
          <textarea
            ref={ref}
            id={fieldId}
            className={textareaClasses}
            aria-invalid={isInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            {...props}
          />
        </motion.div>

        <FieldError id={errorId} error={error} />
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
