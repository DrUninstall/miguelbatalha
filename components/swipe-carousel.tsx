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
import styles from "./swipe-carousel.module.css";

interface CarouselCard {
  title: string;
  description: string;
  gradient: string;
}

const defaultCards: CarouselCard[] = [
  {
    title: "Product Strategy",
    description: "Building roadmaps that balance user needs and business goals",
    gradient: "linear-gradient(135deg, rgb(76, 100, 217), rgb(126, 71, 204))",
  },
  {
    title: "UI Engineering",
    description: "Crafting performant interfaces with modern web technologies",
    gradient: "linear-gradient(135deg, rgb(126, 71, 204), rgb(199, 58, 58))",
  },
  {
    title: "Design Systems",
    description: "Creating scalable, consistent component libraries",
    gradient: "linear-gradient(135deg, rgb(6, 122, 87), rgb(26, 116, 168))",
  },
  {
    title: "Motion Design",
    description: "Animations that feel physical and purposeful",
    gradient: "linear-gradient(135deg, rgb(224, 190, 112), rgb(199, 58, 58))",
  },
  {
    title: "Game Design",
    description: "Gameplay systems and competitive esports integration",
    gradient: "linear-gradient(135deg, rgb(26, 116, 168), rgb(76, 100, 217))",
  },
];

const MAX_CARD_WIDTH = 280;
const CARD_GAP = 16;
/** A swipe commits if it travelled this far (px)… */
const DISTANCE_THRESHOLD = 50;
/** …or was released faster than this (px/s). */
const VELOCITY_THRESHOLD = 500;

/**
 * stiffness 300, damping 22, mass 1 → damping ratio 22 / (2·√300) ≈ 0.64.
 * Underdamped: from rest it overshoots the target by ~7.6% of the distance
 * before settling. A fling adds its release velocity on top.
 */
const SPRING = { type: "spring" as const, stiffness: 300, damping: 22, mass: 1 };

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
      style={{ width, scale, opacity }}
    >
      <div className={styles.cardGradient} style={{ background: card.gradient }} />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
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

  // Cards are at most 280px, and at most 85% of the viewport so the next card peeks in.
  const cardWidth = viewportWidth
    ? Math.min(MAX_CARD_WIDTH, Math.round(viewportWidth * 0.85))
    : MAX_CARD_WIDTH;
  const step = cardWidth + CARD_GAP;
  // Centre the active card in the viewport.
  const inset = viewportWidth ? Math.max(0, (viewportWidth - cardWidth) / 2) : 0;

  // Keep the track aligned if the container is resized.
  useEffect(() => {
    if (!x.isAnimating()) x.set(-activeIndex * step);
  }, [step, activeIndex, x]);

  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < cards.length - 1;

  const goTo = (index: number, velocity = 0) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    setActiveIndex(clamped);
    const target = -clamped * step;
    if (reduceMotion) {
      x.stop();
      x.set(target);
      return;
    }
    // Hand the gesture's release velocity to the spring, so a hard fling
    // arrives with more energy (and overshoots further) than a gentle drag.
    animate(x, target, { ...SPRING, velocity });
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > DISTANCE_THRESHOLD || Math.abs(velocity) > VELOCITY_THRESHOLD) {
      if (offset > 0 || velocity > VELOCITY_THRESHOLD) {
        goTo(activeIndex - 1, velocity);
      } else {
        goTo(activeIndex + 1, velocity);
      }
    } else {
      goTo(activeIndex, velocity);
    }
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
      aria-label="Focus areas"
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
          style={{ x, paddingInline: inset }}
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
