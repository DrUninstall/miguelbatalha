"use client";

import { useState, useId } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from "framer-motion";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import styles from "./password-strength.module.css";

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

// This demo's composition rules. Meeting all of them says nothing about how
// guessable the password is: "Password1!" passes every one.
const rules: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "Contains uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Contains number", test: (pw) => /\d/.test(pw) },
  // Whitespace is not a special character.
  { label: "Contains special character", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

const shareOfRulesMet = (pw: string) =>
  rules.filter((rule) => rule.test(pw)).length / rules.length;

/**
 * Damping ratio 40 / (2·√400) = 1: the meter indicates a value, so it arrives
 * as fast as it can without passing it. Settles in about 0.3s.
 */
const METER_SPRING = { type: "spring", stiffness: 400, damping: 40, mass: 1 } satisfies Transition;

/** Icon swap: no bounce, since overshoot on a 14px icon reads as a glitch. */
const CHECK_SPRING = { type: "spring", duration: 0.3, bounce: 0 } satisfies Transition;

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const inputId = `${id}-input`;
  const rulesId = `${id}-rules`;

  // Share of rules met (0–1), sprung on every change. The fill is clipped rather
  // than scaled, so its rounded end keeps its shape.
  const fill = useMotionValue(0);
  const clipPath = useTransform(fill, (share) => `inset(0 ${(1 - share) * 100}% 0 0 round 2px)`);

  const handleChange = (value: string) => {
    setPassword(value);
    const share = shareOfRulesMet(value);
    if (reduceMotion) fill.set(share);
    else animate(fill, share, METER_SPRING);
  };

  const passed = rules.map((rule) => rule.test(password));
  const metCount = passed.filter(Boolean).length;

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.fieldLabel}>
        Password
      </label>

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
          onChange={(e) => handleChange(e.target.value)}
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

      <div
        className={`${styles.meterTrack} ${metCount === rules.length ? styles.complete : ""}`}
        aria-hidden="true"
      >
        <motion.div className={styles.meterFill} style={{ clipPath }} />
      </div>

      <p className={styles.meterLabel} aria-live="polite">
        {password.length > 0 && `${metCount} of ${rules.length} rules met`}
      </p>

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
                  initial={reduceMotion ? false : { scale: 0.25, opacity: 0, filter: "blur(2px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={CHECK_SPRING}
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
