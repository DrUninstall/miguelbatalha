"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./shared-layout-demo.module.css";

const springTransition = {
  type: "spring" as const,
  duration: 0.55,
  bounce: 0.1,
};

const contentTransition = {
  type: "spring" as const,
  duration: 0.55,
  bounce: 0,
};

// ─────────── Single Element - Tab Position Demo ───────────

const tabs = ["Design", "Engineering", "Product", "Marketing", "Sales"] as const;
type Tab = (typeof tabs)[number];

const tabPositions: Record<Tab, string> = {
  Design: styles.posCenter,
  Engineering: styles.posTopRight,
  Product: styles.posTopLeft,
  Marketing: styles.posBottomLeft,
  Sales: styles.posBottomRight,
};

export function SharedLayoutTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Design");

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsContent}>
        {/* Clickable labels at each position */}
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.positionLabel} ${tabPositions[tab]} ${
              activeTab === tab ? styles.labelActive : styles.labelInactive
            }`}
          >
            {tab}
          </button>
        ))}

        {/* Animated pill behind the active text */}
        <motion.div
          className={`${styles.circle} ${tabPositions[activeTab]}`}
          layoutId="shared-circle"
          transition={springTransition}
        />
      </div>
    </div>
  );
}

// ─────────── Multiple Elements - Color Swap Demo ───────────

const colors = [
  { id: "circle-1", className: styles.circleBrand },
  { id: "circle-2", className: styles.circleError },
  { id: "circle-3", className: styles.circleSuccess },
];

export function SharedLayoutSwap() {
  const [order, setOrder] = useState([0, 1, 2]);

  const shuffle = () => {
    setOrder((prev) => {
      const newOrder = [...prev];
      // Fisher-Yates shuffle
      for (let i = newOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      }
      return newOrder;
    });
  };

  return (
    <div className={styles.swapContainer}>
      <div className={styles.swapCircles}>
        {order.map((colorIndex) => (
          <motion.div
            key={colors[colorIndex].id}
            className={`${styles.swapCircle} ${colors[colorIndex].className}`}
            layoutId={colors[colorIndex].id}
            transition={springTransition}
          />
        ))}
      </div>
      <button onClick={shuffle} className={styles.shuffleButton}>
        Shuffle
      </button>
    </div>
  );
}

// ─────────── Card Expansion - Dialog Demo ───────────

export function SharedLayoutCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.cardContainer}>
      {!isOpen ? (
        <motion.div
          className={styles.card}
          layoutId="expandable-card"
          onClick={() => setIsOpen(true)}
          style={{ borderRadius: 12 }}
          transition={springTransition}
        >
          <motion.h3 className={styles.cardTitle} layoutId="card-title">
            Project Update
          </motion.h3>
          <motion.p className={styles.cardSubtitle} layoutId="card-subtitle">
            Click to expand
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className={styles.dialog}
            layoutId="expandable-card"
            style={{ borderRadius: 16 }}
            transition={springTransition}
          >
            <motion.h3 className={styles.dialogTitle} layoutId="card-title">
              Project Update
            </motion.h3>
            <motion.p className={styles.dialogSubtitle} layoutId="card-subtitle">
              Click to expand
            </motion.p>
            <AnimatePresence mode="wait">
              <motion.div
                key="dialog-content"
                initial={{ opacity: 0, filter: "blur(4px)", scale: 0.95, y: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", scale: 0.95, y: 12 }}
                transition={contentTransition}
                className={styles.dialogContent}
              >
                <p>
                  This is the expanded content of the card. The card container
                  animates using shared layout, while this content fades in
                  separately using AnimatePresence.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className={styles.closeButton}
                >
                  Close
                </button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}
