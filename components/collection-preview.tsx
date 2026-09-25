"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Minimize2 } from "lucide-react";
import styles from "./collection-preview.module.css";

// Dock magnification
const SCALE = 1.5;
const DISTANCE = 100;
const NUDGE = 24;
const DOCK_SPRING = { mass: 0.1, stiffness: 300, damping: 20 };

// Stack ⇄ dock morph (also the default for everything in this demo)
const MORPH_SPRING = { type: "spring" as const, duration: 0.5, bounce: 0 };
// Fan-out on hover/focus; `layout` keeps the morph spring for layoutId moves.
const FAN_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  layout: MORPH_SPRING,
};

// Gradient placeholders for collection items
const COLLECTION_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
];

const AVATAR_GRADIENT = "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)";

// Collapsed stack: rest pose and fanned-out pose per card
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

function Thumbnail({ gradient }: { gradient: string }) {
  return (
    <>
      <div className={styles.image} style={{ background: gradient }} />
      <div className={styles.insetBorder} />
    </>
  );
}

// One magnifying item in the expanded dock
function DockItem({
  index,
  gradient,
  pointerX,
  containerRef,
}: {
  index: number;
  gradient: string;
  pointerX: MotionValue<number>;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  // The slot carries the layoutId; the inner element carries the dock
  // transforms. Measuring the slot means the dock's own scale/x never feed
  // back into the distance it is computed from.
  const slotRef = useRef<HTMLDivElement>(null);

  // Horizontal distance from pointer to this item's centre, both measured
  // relative to the dock container's left edge.
  const distance = useTransform(() => {
    const pointer = pointerX.get();
    const slot = slotRef.current;
    const container = containerRef.current;
    if (pointer === -Infinity || !slot || !container) return -Infinity;
    const slotRect = slot.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const center = slotRect.left - containerRect.left + slotRect.width / 2;
    return pointer - center;
  });

  const scale = useTransform(distance, [-DISTANCE, 0, DISTANCE], [1, SCALE, 1]);

  // Push neighbours away from the magnified item
  const x = useTransform(() => {
    const d = distance.get();
    if (d === -Infinity) return 0;
    if (d < -DISTANCE || d > DISTANCE) return Math.sign(d) * -1 * NUDGE;
    return (-d / DISTANCE) * NUDGE * scale.get();
  });

  const scaleSpring = useSpring(scale, DOCK_SPRING);
  const xSpring = useSpring(x, DOCK_SPRING);

  return (
    <motion.div ref={slotRef} layoutId={`image-${index}`}>
      <motion.div
        className={`${styles.imageWrapper} ${styles.dockImage}`}
        style={{ x: xSpring, scale: scaleSpring }}
      >
        <Thumbnail gradient={gradient} />
      </motion.div>
    </motion.div>
  );
}

function CollapsedState({
  onExpand,
  focusOnMount,
}: {
  onExpand: () => void;
  focusOnMount: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fanned = isHovered || isFocused;

  // Returning from the dock: the Collapse button just unmounted, so put
  // focus back on the control that re-opens it.
  useEffect(() => {
    if (focusOnMount) buttonRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div className={styles.collapsedWrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.stackContainer}
        // Mouse/pen only: a touch tap goes straight to expand.
        onPointerEnter={(e) => e.pointerType !== "touch" && setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        // Keyboard focus fans the stack the same way hover does.
        onFocus={(e) => setIsFocused(e.currentTarget.matches(":focus-visible"))}
        onBlur={() => setIsFocused(false)}
        onClick={onExpand}
        aria-label={`Show all ${COLLECTION_COLORS.length} items`}
      >
        <motion.div
          layoutId="collection-avatar"
          className={styles.avatarWrapper}
          initial={false}
          animate={fanned ? { y: -4 } : { y: 0 }}
        >
          <div
            className={styles.avatar}
            style={{ background: AVATAR_GRADIENT }}
          />
          <div className={styles.insetBorder} />
        </motion.div>

        {COLLECTION_COLORS.map((gradient, index) => (
          <motion.div
            key={index}
            layoutId={`image-${index}`}
            className={styles.stackedImage}
            variants={imageVariants[index]}
            initial="rest"
            animate={fanned ? "hover" : "rest"}
            transition={FAN_TRANSITION}
          >
            <div className={`${styles.imageWrapper} ${styles.stackImage}`}>
              <Thumbnail gradient={gradient} />
            </div>
          </motion.div>
        ))}
      </button>

      <div className={styles.collectionInfo}>
        <motion.p layoutId="collection-name" className={styles.collectionName}>
          Gradients
        </motion.p>
        <motion.p layoutId="collection-count" className={styles.itemCount}>
          {COLLECTION_COLORS.length} items
        </motion.p>
      </div>
    </div>
  );
}

function ExpandedState({ onCollapse }: { onCollapse: () => void }) {
  const pointerX = useMotionValue(-Infinity);
  const containerRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Only ever mounted by a user action, so it's safe to take focus: the
  // stack button that was focused has just unmounted.
  useEffect(() => {
    collapseRef.current?.focus({ preventScroll: true });
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    pointerX.set(e.clientX - container.getBoundingClientRect().left);
  };

  const resetPointer = () => pointerX.set(-Infinity);

  return (
    <div className={styles.expandedWrapper}>
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

      {/* Decorative thumbnails; the header above already names the collection. */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className={styles.expandedContainer}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        onPointerUp={(e) => e.pointerType === "touch" && resetPointer()}
        onPointerCancel={resetPointer}
      >
        {COLLECTION_COLORS.map((gradient, index) => (
          <DockItem
            key={index}
            index={index}
            gradient={gradient}
            pointerX={pointerX}
            containerRef={containerRef}
          />
        ))}
      </div>

      <motion.button
        ref={collapseRef}
        type="button"
        className={styles.collapseButton}
        whileTap={{ scale: 0.95 }}
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0, filter: "blur(4px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0 } }
            : { scale: 0.75, opacity: 0, filter: "blur(4px)" }
        }
        onClick={onCollapse}
      >
        Collapse
        <Minimize2 size={16} aria-hidden="true" />
      </motion.button>
    </div>
  );
}

export function CollectionPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  // False until the first toggle, so the page load never steals focus.
  const [hasToggled, setHasToggled] = useState(false);

  const setExpanded = (value: boolean) => {
    setHasToggled(true);
    setIsExpanded(value);
  };

  return (
    <MotionConfig transition={MORPH_SPRING}>
      <div className={styles.container}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            <motion.div key="collapsed">
              <CollapsedState
                onExpand={() => setExpanded(true)}
                focusOnMount={hasToggled}
              />
            </motion.div>
          ) : (
            <motion.div key="expanded">
              <ExpandedState onCollapse={() => setExpanded(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
