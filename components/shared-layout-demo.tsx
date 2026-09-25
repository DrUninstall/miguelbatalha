"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, spring, useIsPresent } from "framer-motion";
import styles from "./shared-layout-demo.module.css";

// Critically damped (bounce: 0): everything here moves because of a click, so
// nothing overshoots.
const moveSpring = { type: "spring" as const, bounce: 0, duration: 0.4 };

// Exits run at about three quarters of the entrance.
const closeSpring = { type: "spring" as const, bounce: 0, duration: 0.3 };

// Arrow keys, Home and End switch tabs instantly: the key press is frequent and
// focus already shows where you are.
const instant = { duration: 0 };

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

// The pill's spring written out as a CSS `linear()` easing, so the label colour
// transition runs on exactly the same curve as the pill. `duration` is in ms here.
const tabColorTiming = spring({
  keyframes: [0, 1],
  bounce: moveSpring.bounce,
  duration: moveSpring.duration * 1000,
}).toString();

export function SharedLayoutTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  // Set by arrow/Home/End, cleared by any pointer press on the tabs.
  const [viaKeyboard, setViaKeyboard] = useState(false);

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
    setViaKeyboard(true);
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
        style={{ "--tab-color-timing": tabColorTiming } as CSSProperties}
        data-instant={viaKeyboard || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={() => setViaKeyboard(false)}
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
              {isActive && (
                <motion.span
                  // layoutIds are global to the page: prefix them per instance.
                  layoutId={`${baseId}-highlight`}
                  className={styles.tabHighlight}
                  // A pixel radius in `style` is what Framer scale-corrects.
                  style={{ borderRadius: 16 }}
                  transition={viaKeyboard ? instant : moveSpring}
                />
              )}
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* initial={false}: the first panel is rendered visible, on the server too. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current.id}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
          tabIndex={0}
          className={styles.tabPanel}
          initial={viaKeyboard ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {current.body}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────── Element swap ───────────

const colors = [
  { id: "brand", className: styles.circleBrand },
  { id: "error", className: styles.circleError },
  { id: "success", className: styles.circleSuccess },
];

// Fisher–Yates, retried until the order differs, so every press moves something.
// Needs at least two items, or no different order exists.
function shuffleDifferent<T>(items: readonly T[]): T[] {
  let next = [...items];
  while (next.every((item, index) => item === items[index])) {
    next = [...items];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  }
  return next;
}

export function SharedLayoutSwap() {
  const [items, setItems] = useState(colors);

  return (
    <div className={styles.swapContainer}>
      {/* Purely decorative: the circles carry no information of their own. */}
      <div className={styles.swapCircles} aria-hidden="true">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            className={`${styles.swapCircle} ${item.className}`}
            transition={moveSpring}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems(shuffleDifferent(items))}
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

/**
 * Child of AnimatePresence: tells its render function whether it is animating
 * out, so an exiting layer can stop taking clicks and focus immediately
 * instead of blocking the page until its exit animation finishes.
 */
function ExitGuard({
  children,
}: {
  children: (exiting: boolean) => ReactNode;
}) {
  return children(!useIsPresent());
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SharedLayoutCard() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const layoutIds = {
    surface: `${id}-surface`,
    title: `${id}-title`,
    subtitle: `${id}-subtitle`,
  };
  const titleId = `${id}-heading`;
  const isClient = useIsClient();

  // Page scroll locked while open, with the scrollbar's width kept as padding.
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    cardRef.current?.focus({ preventScroll: true });
  };

  // Escape closes; Tab and Shift+Tab wrap inside the dialog. The dialog itself
  // is focusable (tabIndex -1), so a click on its text keeps focus in here.
  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = event.currentTarget;
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeEl = document.activeElement;
    if (event.shiftKey && (activeEl === first || activeEl === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={styles.cardContainer}>
      {/* The focus ring is drawn by this wrapper, which Framer never transforms,
          so it isn't stretched while the card morphs back. */}
      <div className={styles.cardFrame}>
        {/* The card stays mounted. While the dialog (same layoutId) is open,
            Framer makes the dialog the lead and fades the card out; on close
            the card becomes lead again and animates back from the dialog's box. */}
        <motion.button
          ref={cardRef}
          type="button"
          className={styles.card}
          layoutId={layoutIds.surface}
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          style={{ borderRadius: 12 }}
          transition={closeSpring}
        >
          <motion.span
            className={styles.cardTitle}
            layoutId={layoutIds.title}
            transition={closeSpring}
          >
            Project update
          </motion.span>
          <motion.span
            className={styles.cardSubtitle}
            layoutId={layoutIds.subtitle}
            layout="position"
            transition={closeSpring}
          >
            Q3 roadmap · 3 min read
          </motion.span>
        </motion.button>
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <ExitGuard key="dialog">
                {(exiting) => (
                  // One fixed layer holds the overlay and the dialog. Its grid
                  // does the centring, so the dialog carries no CSS transform
                  // for Framer's inline transform to clobber.
                  <div className={styles.dialogLayer} inert={exiting}>
                    <motion.div
                      className={styles.overlay}
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: moveSpring }}
                      exit={{ opacity: 0, transition: closeSpring }}
                      onClick={close}
                    />
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby={titleId}
                      tabIndex={-1}
                      className={styles.dialog}
                      layoutId={layoutIds.surface}
                      style={{ borderRadius: 16 }}
                      transition={moveSpring}
                      onKeyDown={onDialogKeyDown}
                    >
                      <motion.h2
                        id={titleId}
                        className={styles.dialogTitle}
                        layoutId={layoutIds.title}
                        transition={moveSpring}
                      >
                        Project update
                      </motion.h2>
                      <motion.p
                        className={styles.dialogSubtitle}
                        layoutId={layoutIds.subtitle}
                        layout="position"
                        transition={moveSpring}
                      >
                        Q3 roadmap · 3 min read
                      </motion.p>
                      {/* `layout` makes Framer counter-scale this block, so its
                          text isn't stretched by the dialog's scale. */}
                      <motion.div
                        className={styles.dialogContent}
                        layout
                        transition={moveSpring}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: {
                            duration: 0.2,
                            delay: 0.1,
                            ease: "easeOut",
                          },
                        }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      >
                        <p>
                          The card and this dialog are two different elements
                          that share a layoutId. Framer measures both boxes and
                          animates the difference with transforms, while this
                          text fades in once the morph is underway.
                        </p>
                        <button
                          type="button"
                          // Mounted only by opening the dialog, so taking focus is expected.
                          autoFocus
                          onClick={close}
                          className={styles.closeButton}
                        >
                          Close
                        </button>
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </ExitGuard>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
