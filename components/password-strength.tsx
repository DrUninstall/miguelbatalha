"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import styles from "./password-strength.module.css";

interface StrengthRule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: StrengthRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "Contains uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Contains number", test: (pw) => /\d/.test(pw) },
  { label: "Contains special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const levels = [
  { label: "Weak", className: styles.weak },
  { label: "Fair", className: styles.fair },
  { label: "Good", className: styles.good },
  { label: "Strong", className: styles.strong },
];

/**
 * stiffness 400, damping 25, mass 1 → damping ratio 25 / (2·√400) = 0.625.
 * Slightly underdamped: the fill overshoots its new width by ~8% of the change
 * and settles back.
 */
const METER_SPRING = { type: "spring" as const, stiffness: 400, damping: 25, mass: 1 };

/** Check icon pop: damping ratio 15 / (2·√500) ≈ 0.34, a quick bouncy settle. */
const POP_SPRING = { type: "spring" as const, stiffness: 500, damping: 15, mass: 1 };

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const inputId = `${id}-input`;
  const rulesId = `${id}-rules`;

  const passed = rules.map((r) => r.test(password));
  const strength = passed.filter(Boolean).length; // 0..4
  const level = levels[Math.max(0, strength - 1)];

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.fieldLabel}>
        Password
      </label>

      {/* Input */}
      <div className={styles.inputWrapper}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Lock size={16} className={styles.lockIcon} />
        </div>
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          className={styles.input}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          aria-describedby={rulesId}
        />
        <button
          type="button"
          className={styles.toggleVisibility}
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Show password"
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Strength meter: one bar, filled with a spring on scaleX (0, ¼, ½, ¾, 1). */}
      <div className={`${styles.strengthTrack} ${level.className}`} aria-hidden="true">
        <motion.div
          className={styles.strengthFill}
          initial={false}
          animate={{ scaleX: strength / rules.length }}
          transition={METER_SPRING}
        />
      </div>

      {/* Strength label */}
      <p className={styles.strengthLabel} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {password.length > 0 && (
            <motion.span
              key={level.label}
              className={`${styles.strengthText} ${level.className}`}
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <span className={styles.srOnly}>Password strength: </span>
              {level.label}
            </motion.span>
          )}
        </AnimatePresence>
      </p>

      {/* Rules checklist */}
      <ul className={styles.rules} id={rulesId}>
        {rules.map((rule, i) => (
          <li
            key={rule.label}
            className={`${styles.rule} ${passed[i] ? styles.ruleMet : ""}`}
          >
            <span className={styles.ruleIcon} aria-hidden="true">
              {passed[i] ? (
                <motion.span
                  key="met"
                  className={styles.ruleIconInner}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={POP_SPRING}
                >
                  <Check size={14} />
                </motion.span>
              ) : (
                <span key="unmet" className={styles.ruleIconInner}>
                  <X size={14} />
                </span>
              )}
            </span>
            {rule.label}
            <span className={styles.srOnly}>{passed[i] ? " (met)" : " (not met)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
