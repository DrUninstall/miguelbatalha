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
/** A swipe commits if it travelled this far (px)… */
const DISTANCE_THRESHOLD = 50;
/** …or was released faster than this (px/s). */
const VELOCITY_THRESHOLD = 500;

/**
 * Drag release: stiffness 300, damping 22, mass 1 → damping ratio
 * 22 / (2·√300) ≈ 0.64. Underdamped, and it starts with the finger's release
 * velocity, so a hard fling carries through and overshoots a little before
 * settling. Only used when there is a throw to carry.
 */
const RELEASE_SPRING = { type: "spring" as const, stiffness: 300, damping: 22, mass: 1 };

/**
 * Buttons, dots and arrow keys: stiffness 400, damping 40, mass 1 → damping
 * ratio 40 / (2·√400) = 1. Nothing was thrown, so the track arrives without
 * overshooting.
 */
const SNAP_SPRING = { type: "spring" as const, stiffness: 400, damping: 40, mass: 1 };

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

  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < cards.length - 1;

  /**
   * Moves to a card. `release` is the drag's release velocity (px/s) when the
   * move ends a drag; without it (buttons, dots, keys) the snap spring is used.
   */
  const goTo = (index: number, release?: number) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    setActiveIndex(clamped);
    const target = -clamped * step;
    if (reduceMotion) {
      x.stop();
      x.set(target);
      return;
    }
    animate(
      x,
      target,
      release === undefined
        ? SNAP_SPRING
        : // Hand the release velocity to the spring, so a hard fling arrives
          // with more energy (and overshoots further) than a gentle drag.
          { ...RELEASE_SPRING, velocity: release }
    );
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // A fast flick decides by its direction, even if the finger had first
    // dragged the other way; otherwise the distance travelled decides.
    let direction = 0;
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) direction = velocity < 0 ? 1 : -1;
    else if (Math.abs(offset) > DISTANCE_THRESHOLD) direction = offset < 0 ? 1 : -1;

    goTo(activeIndex + direction, velocity);
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
          dragConstraints={{ left: -(cards.length - 1) * step, right: 0 }}
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
          disabled={!canGoLeft}
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
          disabled={!canGoRight}
          aria-label="Next card"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
