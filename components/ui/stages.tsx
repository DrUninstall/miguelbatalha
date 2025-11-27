"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { IconButton } from "@/components/ui/icon-button";
import styles from "./stages.module.css";

interface Stage {
  id: string;
  label: string;
}

interface StagesProps {
  stages: Stage[];
  currentStage: number;
  onBack?: () => void;
  className?: string;
}

export function Stages({
  stages,
  currentStage,
  onBack,
  className = "",
}: StagesProps) {
  const progressPercentage = ((currentStage + 1) / stages.length) * 100;

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header with back button */}
      <div className={styles.header}>
        {onBack && currentStage > 0 && (
          <IconButton
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className={styles.backIcon} />
          </IconButton>
        )}
        <div className={styles.headerContent}>
          <p className={styles.stepInfo}>
            Step {currentStage + 1} of {stages.length}
          </p>
          <h2 className={styles.stepTitle}>
            {stages[currentStage]?.label}
          </h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      </div>

      {/* Stage indicators */}
      <div className={styles.indicators}>
        {stages.map((stage, index) => {
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;

          const circleClasses = [
            styles.indicatorCircle,
            isCompleted ? styles.completed : isActive ? styles.active : styles.inactive
          ].join(" ");

          const labelClasses = [
            styles.indicatorLabel,
            isActive || isCompleted ? styles.activeOrCompleted : styles.inactive
          ].join(" ");

          return (
            <div
              key={stage.id}
              className={styles.indicator}
            >
              <motion.div
                className={circleClasses}
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <motion.path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        type: "spring",
                        duration: 0.35,
                        bounce: 0,
                      }}
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={labelClasses}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
