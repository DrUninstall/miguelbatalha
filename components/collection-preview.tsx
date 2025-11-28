"use client";

import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import styles from "./collection-preview.module.css";

// Animation constants
const SCALE = 1.5;
const DISTANCE = 100;
const NUDGE = 24;
const SPRING_CONFIG = { mass: 0.1, stiffness: 300, damping: 20 };

// Gradient placeholders for collection items
const COLLECTION_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
];

// Avatar gradient
const AVATAR_GRADIENT = "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)";

// Variants for collapsed state hover animation
const imageVariants = [
  {
    hover: { rotate: -24, x: -32, y: -20, zIndex: 3 },
    rest: { rotate: -12, x: 0, y: 0, zIndex: 3 },
  },
  {
    hover: { rotate: 24, x: 28, y: -16, zIndex: 4 },
    rest: { rotate: 12, x: 0, y: 0, zIndex: 4 },
  },
  {
    hover: { rotate: 24, x: 24, y: -48, zIndex: 1 },
    rest: { rotate: 24, x: 0, y: 0, zIndex: 1 },
  },
  {
    hover: { rotate: -16, x: -24, y: -44, zIndex: 2 },
    rest: { rotate: -24, x: 0, y: 0, zIndex: 2 },
  },
];

// Shared image component
function CollectionImage({
  gradient,
  size,
  isExpanded,
  mouseLeft,
}: {
  gradient: string;
  size: number;
  isExpanded: boolean;
  mouseLeft?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Calculate distance from mouse to image center
  const distance = useTransform(() => {
    if (!isExpanded || !mouseLeft) return -Infinity;
    const bounds = ref.current
      ? { x: ref.current.offsetLeft, width: ref.current.offsetWidth }
      : { x: 0, width: 0 };
    return (mouseLeft.get() ?? 0) - bounds.x - bounds.width / 2;
  });

  // Scale based on proximity
  const scale = useTransform(distance, [-DISTANCE, 0, DISTANCE], [1, SCALE, 1]);

  // Offset calculation for push effect
  const x = useTransform(() => {
    const currentDistance = distance.get();
    const currentScale = scale.get();

    if (currentDistance === -Infinity) return 0;
    if (currentDistance < -DISTANCE || currentDistance > DISTANCE) {
      return Math.sign(currentDistance) * -1 * NUDGE;
    }
    return (-currentDistance / DISTANCE) * NUDGE * currentScale;
  });

  const scaleSpring = useSpring(scale, SPRING_CONFIG);
  const xSpring = useSpring(x, SPRING_CONFIG);

  return (
    <motion.div
      ref={ref}
      className={styles.imageWrapper}
      style={{
        width: size,
        height: size,
        ...(isExpanded && { x: xSpring, scale: scaleSpring }),
      }}
    >
      <div
        className={styles.image}
        style={{ background: gradient }}
      />
      <div className={styles.insetBorder} />
    </motion.div>
  );
}

// Collapsed state component
function CollapsedState({
  setIsExpanded,
}: {
  setIsExpanded: (value: boolean) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div className={styles.collapsedWrapper}>
      <button
        className={styles.stackContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(true)}
        aria-label="Expand collection preview"
      >
        {/* Collection avatar */}
        <motion.div
          layoutId="collection-avatar"
          className={styles.avatarWrapper}
          initial={false}
          animate={isHovered ? { y: -4 } : { y: 0 }}
        >
          <div
            className={styles.avatar}
            style={{ background: AVATAR_GRADIENT }}
          />
          <div className={styles.insetBorder} />
        </motion.div>

        {/* Stacked images */}
        {COLLECTION_COLORS.map((gradient, index) => (
          <motion.div
            key={index}
            layoutId={`image-${index}`}
            className={styles.stackedImage}
            variants={imageVariants[index]}
            initial="rest"
            animate={isHovered ? "hover" : "rest"}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <CollectionImage
              gradient={gradient}
              size={64}
              isExpanded={false}
            />
          </motion.div>
        ))}
      </button>

      {/* Collection info */}
      <div className={styles.collectionInfo}>
        <motion.p layoutId="collection-name" className={styles.collectionName}>
          Gradients
        </motion.p>
        <motion.p layoutId="collection-count" className={styles.itemCount}>
          {COLLECTION_COLORS.length} items
        </motion.p>
      </div>
    </motion.div>
  );
}

// Expanded state component
function ExpandedState({
  setIsExpanded,
}: {
  setIsExpanded: (value: boolean) => void;
}) {
  const mouseLeft = useMotionValue(-Infinity);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseLeft.set(e.clientX - rect.left);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      mouseLeft.set(touch.clientX - rect.left);
    }
  };

  const handleMouseLeave = () => {
    mouseLeft.set(-Infinity);
  };

  return (
    <motion.div className={styles.expandedWrapper}>
      {/* Avatar and info */}
      <div className={styles.expandedHeader}>
        <motion.div
          layoutId="collection-avatar"
          className={styles.expandedAvatarWrapper}
        >
          <div
            className={styles.expandedAvatar}
            style={{ background: AVATAR_GRADIENT }}
          />
          <div className={styles.insetBorder} />
        </motion.div>
        <div className={styles.expandedInfo}>
          <motion.p layoutId="collection-name" className={styles.collectionName}>
            Gradients
          </motion.p>
          <motion.p layoutId="collection-count" className={styles.itemCount}>
            {COLLECTION_COLORS.length} items
          </motion.p>
        </div>
      </div>

      {/* Expanded images with dock effect */}
      <motion.div
        ref={containerRef}
        className={styles.expandedContainer}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleMouseLeave}
      >
        {COLLECTION_COLORS.map((gradient, index) => (
          <motion.div key={index} layoutId={`image-${index}`}>
            <CollectionImage
              gradient={gradient}
              size={72}
              isExpanded={true}
              mouseLeft={mouseLeft}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* View All button */}
      <motion.button
        className={styles.viewAllButton}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.5, opacity: 0, filter: "blur(4px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.75, opacity: 0, filter: "blur(4px)" }}
        onClick={() => setIsExpanded(false)}
        aria-label="Collapse preview"
      >
        View All
        <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
}

// Main component
export function CollectionPreview() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
      <div className={styles.container}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            <motion.div key="collapsed">
              <CollapsedState setIsExpanded={setIsExpanded} />
            </motion.div>
          ) : (
            <motion.div key="expanded">
              <ExpandedState setIsExpanded={setIsExpanded} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
