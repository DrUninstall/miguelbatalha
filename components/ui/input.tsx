import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label, associated with the field via htmlFor/id. */
  label: string;
  /** Error message rendered below the field, linked with aria-describedby; also sets aria-invalid. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, "aria-describedby": describedBy, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const errorId = `${fieldId}-error`;
    const ariaDescribedBy = [describedBy, error && errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={styles.container}>
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={[styles.input, error && styles.invalid, className].filter(Boolean).join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        {error && (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
