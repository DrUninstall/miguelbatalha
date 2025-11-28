"use client";

import { useState } from "react";
import styles from "./will-change-demo.module.css";

export function WillChangeDemo() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.comparison}>
        {/* Without will-change */}
        <div className={styles.demoBox}>
          <p className={styles.label}>Without will-change</p>
          <div className={styles.trackWithout}>
            <div
              className={`${styles.ball} ${styles.ballWithout} ${isAnimating ? styles.animating : ""}`}
            />
          </div>
          <p className={styles.hint}>May stutter on first frame</p>
        </div>

        {/* With will-change */}
        <div className={styles.demoBox}>
          <p className={styles.label}>With will-change</p>
          <div className={styles.trackWith}>
            <div
              className={`${styles.ball} ${styles.ballWith} ${isAnimating ? styles.animating : ""}`}
            />
          </div>
          <p className={styles.hint}>Pre-promoted to GPU layer</p>
        </div>
      </div>

      <button
        className={styles.triggerButton}
        onClick={() => setIsAnimating(!isAnimating)}
      >
        {isAnimating ? "Reset" : "Animate"}
      </button>

      <div className={styles.codeComparison}>
        <div className={styles.codeBlock}>
          <code className={styles.code}>
            {`.element {
  transform: translateX(0);
  transition: transform 0.5s;
}`}
          </code>
        </div>
        <div className={styles.codeBlock}>
          <code className={styles.code}>
            {`.element {
  will-change: transform;
  transform: translateX(0);
  transition: transform 0.5s;
}`}
          </code>
        </div>
      </div>
    </div>
  );
}
