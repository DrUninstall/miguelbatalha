"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
  type MotionValue,
  type PanInfo,
  type Transition,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMeasure } from "@/lib/use-measure";
import { blogPosts } from "@/app/blog/_data/posts";
import styles from "./swipe-carousel.module.css";

interface CarouselCard {
  title: string;
  description: string;
  gradient: string;
}

const gradients = [
  "linear-gradient(135deg, rgb(76, 100, 217), rgb(126, 71, 204))",
  "linear-gradient(135deg, rgb(126, 71, 204), rgb(199, 58, 58))",
  "linear-gradient(135deg, rgb(6, 122, 87), rgb(26, 116, 168))",
  "linear-gradient(135deg, rgb(224, 190, 112), rgb(199, 58, 58))",
  "linear-gradient(135deg, rgb(26, 116, 168), rgb(76, 100, 217))",
  "linear-gradient(135deg, rgb(199, 58, 58), rgb(224, 190, 112))",
];

// The site's own posts: one card per article.
const defaultCards: CarouselCard[] = blogPosts.map((post, i) => ({
  title: post.title,
  description: post.description,
  gradient: gradients[i % gradients.length],
}));

/** Must match the CSS: cards are min(280px, 85% of the viewport), 16px apart. */
const MAX_CARD_WIDTH = 280;
const CARD_WIDTH_RATIO = 0.85;
const CARD_GAP = 16;

/**
 * How far (px) a release at `velocity` (px/s) would coast if the track
 * decelerated like a scroll view: exponential decay at `rate` per millisecond.
 * 0.99 is the faster, paging-style deceleration.
 */
function project(velocity: number, rate = 0.99) {
  return ((velocity / 1000) * rate) / (1 - rate);
}

/** Drag release: damping ratio 22 / (2·√300) ≈ 0.64, so a thrown card overshoots a little. */
const RELEASE_SPRING = { type: "spring", stiffness: 300, damping: 22, mass: 1 } satisfies Transition;

/** Buttons, dots, arrow keys and the edges: damping ratio 40 / (2·√400) = 1, no overshoot from rest. */
const SNAP_SPRING = { type: "spring", stiffness: 400, damping: 40, mass: 1 } satisfies Transition;

function Card({
  card,
  index,
  total,
  x,
  step,
  width,
}: {
  card: CarouselCard;
  index: number;
  total: number;
  x: MotionValue<number>;
  step: number;
  width: number;
}) {
  // How far (px) this card is from the resting position of the active card.
  const distance = useTransform(x, (latest) => Math.abs(latest + index * step));
  const scale = useTransform(distance, [0, width], [1, 0.92]);
  const opacity = useTransform(distance, [0, width * 1.5], [1, 0.5]);

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      className={styles.card}
      // Width comes from CSS (see .card); only the transforms are driven here.
      style={{ scale, opacity }}
    >
      <div className={styles.cardGradient} style={{ background: card.gradient }} />
      <div className={styles.cardContent}>
        <p className={styles.cardTitle}>{card.title}</p>
        <p className={styles.cardDescription}>{card.description}</p>
      </div>
    </motion.div>
  );
}

export function SwipeCarousel({
  cards = defaultCards,
}: {
  cards?: CarouselCard[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [viewportRef, { width: viewportWidth }] = useMeasure<HTMLDivElement>();

  // CSS sizes and centres the cards (so the server-rendered HTML is already in
  // its final layout); JS repeats the same formula only for the drag maths.
  // Before the first measurement this falls back to the desktop width, which
  // only matters for the scale/opacity of off-screen cards.
  const cardWidth = viewportWidth
    ? Math.min(MAX_CARD_WIDTH, viewportWidth * CARD_WIDTH_RATIO)
    : MAX_CARD_WIDTH;
  const step = cardWidth + CARD_GAP;

  // Keep the track aligned if the container is resized.
  useEffect(() => {
    if (!x.isAnimating()) x.set(-activeIndex * step);
  }, [step, activeIndex, x]);

  const lastIndex = cards.length - 1;

  /** Moves to a card; buttons, dots and keys pass nothing and get the snap spring. */
  const goTo = (index: number, transition: Transition = SNAP_SPRING) => {
    const clamped = Math.max(0, Math.min(index, lastIndex));
    setActiveIndex(clamped);
    const target = -clamped * step;
    if (reduceMotion) {
      x.stop();
      x.set(target);
      return;
    }
    animate(x, target, transition);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const velocity = info.velocity.x;
    // Where the track would come to rest, in cards (fractional, may lie past either end).
    const resting = -(x.get() + project(velocity)) / step;
    const index = Math.max(0, Math.min(Math.round(resting), lastIndex));

    if (resting >= 0 && resting <= lastIndex) {
      goTo(index, { ...RELEASE_SPRING, velocity });
      return;
    }
    // The fling points past the first or last card. Keep its speed only if it is
    // heading toward that card: velocity pointing away (a drag the edge was
    // resisting) would carry the underdamped spring out into empty space.
    const headingToTarget = (-index * step - x.get()) * velocity > 0;
    goTo(index, { ...SNAP_SPRING, velocity: headingToTarget ? velocity : 0 });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    }
  };

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Blog posts"
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.viewport}
        ref={viewportRef}
        tabIndex={0}
        aria-label="Slides. Use the left and right arrow keys to navigate."
        role="group"
      >
        <motion.div
          className={styles.track}
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -lastIndex * step, right: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {cards.map((card, i) => (
            <Card
              key={card.title}
              card={card}
              index={i}
              total={cards.length}
              x={x}
              step={step}
              width={cardWidth}
            />
          ))}
        </motion.div>
      </div>

      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {`Card ${activeIndex + 1} of ${cards.length}: ${cards[activeIndex]?.title ?? ""}`}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
        </button>
        <div className={styles.dots}>
          {cards.map((card, i) => (
            <button
              type="button"
              key={card.title}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === lastIndex}
          aria-label="Next card"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
