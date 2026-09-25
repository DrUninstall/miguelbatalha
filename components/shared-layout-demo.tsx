"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./shared-layout-demo.module.css";

// Critically damped (bounce: 0): the highlight settles without overshoot.
const tabSpring = { type: "spring" as const, bounce: 0, duration: 0.4 };

// A touch of bounce for things that physically move somewhere new.
const moveSpring = { type: "spring" as const, bounce: 0.1, duration: 0.55 };

// ─────────── Tab indicator ───────────

const tabs = [
  {
    id: "product",
    label: "Product",
    body: "Roadmap, priorities and the problems worth solving next.",
  },
  {
    id: "design",
    label: "Design",
    body: "Flows, prototypes and the system that keeps them consistent.",
  },
  {
    id: "engineering",
    label: "Engineering",
    body: "Architecture, performance budgets and shipping safely.",
  },
  {
    id: "marketing",
    label: "Marketing",
    body: "Launch plans, positioning and the story we tell.",
  },
];

export function SharedLayoutTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const reduceMotion = useReducedMotion();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = active === last ? 0 : active + 1;
        break;
      case "ArrowLeft":
        next = active === 0 ? last : active - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const current = tabs[active];

  return (
    <div className={styles.tabs}>
      <div
        role="tablist"
        aria-label="Teams"
        className={styles.tabList}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => {
          const isActive = index === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel`}
              tabIndex={isActive ? 0 : -1}
              className={styles.tab}
              onClick={() => setActive(index)}
            >
              {/* The highlight only exists inside the active tab. When another
                  tab becomes active, a new span with the same layoutId mounts
                  there and Framer animates it from the old one's box. */}
              {isActive && (
                <motion.span
                  layoutId="tab-highlight"
                  className={styles.tabHighlight}
                  // Radius set via style so Framer can scale-correct it while
                  // the pill stretches between tabs of different widths.
                  style={{ borderRadius: 16 }}
                  transition={tabSpring}
                />
              )}
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={current.id}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className={styles.tabPanel}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {current.body}
      </motion.div>
    </div>
  );
}

// ─────────── Element swap ───────────

const colors = [
  { id: "brand", className: styles.circleBrand },
  { id: "error", className: styles.circleError },
  { id: "success", className: styles.circleSuccess },
];

// Fisher–Yates, retried until the result differs from the input so every
// press visibly moves something.
function shuffleDifferent(order: number[]) {
  let next = order;
  while (next.every((value, index) => value === order[index])) {
    next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  }
  return next;
}

export function SharedLayoutSwap() {
  const [order, setOrder] = useState([0, 1, 2]);

  return (
    <div className={styles.swapContainer}>
      {/* Purely decorative: the circles carry no information of their own. */}
      <div className={styles.swapCircles} aria-hidden="true">
        {order.map((colorIndex) => (
          <motion.div
            // Stable key = identity. React keeps the same DOM node and just
            // moves it; `layout` animates it from its old box to its new one.
            key={colors[colorIndex].id}
            layout
            className={`${styles.swapCircle} ${colors[colorIndex].className}`}
            transition={moveSpring}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOrder(shuffleDifferent(order))}
        className={styles.shuffleButton}
      >
        Shuffle
      </button>
    </div>
  );
}

// ─────────── Card expansion ───────────

const subscribeNoop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SharedLayoutCard() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const titleId = useId();
  const isClient = useIsClient();
  const reduceMotion = useReducedMotion();

  // Focus: into the dialog on open, back to the card on close.
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      cardRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Escape to close, Tab trapped inside the dialog, page scroll locked.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      const inside = dialogRef.current.contains(activeEl);
      if (event.shiftKey && (activeEl === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeEl === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };

    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className={styles.cardContainer}>
      {/* The card stays mounted. While the dialog (same layoutId) is open,
          Framer makes the dialog the lead and hides the card; on close the
          card becomes lead again and animates back from the dialog's box. */}
      <motion.button
        ref={cardRef}
        type="button"
        className={styles.card}
        layoutId="expandable-card"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        style={{ borderRadius: 12 }}
        transition={moveSpring}
      >
        <motion.span
          className={styles.cardTitle}
          layoutId="card-title"
          transition={moveSpring}
        >
          Project Update
        </motion.span>
        <motion.span
          className={styles.cardSubtitle}
          layoutId="card-subtitle"
          transition={moveSpring}
        >
          Q3 roadmap · 3 min read
        </motion.span>
      </motion.button>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="overlay"
                className={styles.overlay}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                onClick={close}
              />
            )}
            {isOpen && (
              // Full-viewport grid does the centring, so the dialog itself
              // carries no CSS transform for Framer's inline transform to clobber.
              <div key="dialog-layer" className={styles.dialogLayer}>
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className={styles.dialog}
                  layoutId="expandable-card"
                  style={{ borderRadius: 16 }}
                  transition={moveSpring}
                >
                  <motion.h2
                    id={titleId}
                    className={styles.dialogTitle}
                    layoutId="card-title"
                    transition={moveSpring}
                  >
                    Project Update
                  </motion.h2>
                  <motion.p
                    className={styles.dialogSubtitle}
                    layoutId="card-subtitle"
                    transition={moveSpring}
                  >
                    Q3 roadmap · 3 min read
                  </motion.p>
                  <motion.div
                    className={styles.dialogContent}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.2, delay: 0.1, ease: "easeOut" },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: reduceMotion ? 0 : 0.1 },
                    }}
                  >
                    <p>
                      The card and this dialog are two different elements that
                      share a layoutId. Framer measures both boxes and animates
                      the difference with transforms, while this text fades in
                      once the morph is underway.
                    </p>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={close}
                      className={styles.closeButton}
                    >
                      Close
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
