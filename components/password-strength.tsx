"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
const strengthColors = [
  "rgb(var(--red-light-1000))",
  "rgb(var(--amber-light-1000))",
  "rgb(var(--teal-light-1000))",
  "rgb(var(--green-light-1000))",
];

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passed = useMemo(
    () => rules.map((r) => r.test(password)),
    [password]
  );

  const strength = passed.filter(Boolean).length;
  const strengthIndex = Math.max(0, strength - 1);

  return (
    <div className={styles.container}>
      {/* Input */}
      <div className={styles.inputWrapper}>
        <div className={styles.iconWrapper}>
          <Lock size={16} className={styles.lockIcon} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          className={styles.input}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          className={styles.toggleVisibility}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Strength bar */}
      <div className={styles.strengthBar}>
        {rules.map((_, i) => (
          <motion.div
            key={i}
            className={styles.strengthSegment}
            animate={{
              background:
                i < strength
                  ? strengthColors[strengthIndex]
                  : "rgb(var(--fill-weak))",
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>

      {/* Strength label */}
      <AnimatePresence mode="wait">
        {password.length > 0 && (
          <motion.p
            key={strengthIndex}
            className={styles.strengthLabel}
            style={{ color: strengthColors[strengthIndex] }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {strengthLabels[strengthIndex]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Rules checklist */}
      <ul className={styles.rules}>
        {rules.map((rule, i) => (
          <motion.li
            key={rule.label}
            className={styles.rule}
            animate={{
              color: passed[i]
                ? "rgb(var(--green-light-1000))"
                : "rgb(var(--text-weak))",
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className={styles.ruleIcon}
              initial={false}
              animate={{
                scale: passed[i] ? [1.3, 1] : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {passed[i] ? <Check size={14} /> : <X size={14} />}
            </motion.span>
            {rule.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
