"use client";

import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { IconButton } from "@/components/ui/icon-button";
import styles from "./stages.module.css";

interface Stage {
  id: string;
  label: string;
}

interface StagesProps {
  stages: Stage[];
  /** Zero-based index of the current stage. */
  currentStage: number;
  onBack?: () => void;
  /** Accessible name for the step list. */
  "aria-label"?: string;
  /**
   * Element for the current stage's title. Defaults to a plain paragraph so
   * the component never injects a heading into the surrounding outline.
   */
  titleAs?: "p" | "h2" | "h3" | "h4";
  className?: string;
}

const PROGRESS_SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const CIRCLE_SPRING = { type: "spring", stiffness: 400, damping: 25 } as const;
const CHECK_TRANSITION = { type: "spring", duration: 0.35, bounce: 0 } as const;

export function Stages({
  stages,
  currentStage,
  onBack,
  "aria-label": ariaLabel = "Progress",
  titleAs: Title = "p",
  className = "",
}: StagesProps) {
  const shouldReduceMotion = useReducedMotion();
  // Fraction of the bar that is filled: the current stage counts as reached,
  // so stage 1 of 4 shows 1/4 and the last stage shows the full bar.
  const progress = stages.length > 0 ? (currentStage + 1) / stages.length : 0;

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        {onBack && currentStage > 0 && (
          <IconButton onClick={onBack} aria-label="Go back">
            <ArrowLeft />
          </IconButton>
        )}
        <div className={styles.headerContent} aria-live="polite">
          <p className={styles.stepInfo}>
            Step {currentStage + 1} of {stages.length}
          </p>
          <Title className={styles.stepTitle}>{stages[currentStage]?.label}</Title>
        </div>
      </div>

      {/* Progress bar: scaled, not resized, so it never triggers layout. */}
      <div className={styles.progressBar} aria-hidden="true">
        <motion.div
          className={styles.progressFill}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={PROGRESS_SPRING}
        />
      </div>

      <ol className={styles.indicators} aria-label={ariaLabel}>
        {stages.map((stage, index) => {
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;

          const circleClasses = [
            styles.indicatorCircle,
            isCompleted ? styles.completed : isActive ? styles.active : styles.inactive,
          ].join(" ");

          const labelClasses = [
            styles.indicatorLabel,
            isActive || isCompleted ? styles.activeOrCompleted : styles.inactive,
          ].join(" ");

          return (
            <li
              key={stage.id}
              className={styles.indicator}
              aria-current={isActive ? "step" : undefined}
            >
              <motion.div
                className={circleClasses}
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={CIRCLE_SPRING}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <motion.path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={shouldReduceMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={CHECK_TRANSITION}
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={labelClasses}>
                {stage.label}
                {isCompleted && <span className={styles.visuallyHidden}> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
