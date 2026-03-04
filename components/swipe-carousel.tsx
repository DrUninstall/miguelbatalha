"use client";

import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const CARD_WIDTH = 280;
const CARD_GAP = 16;
const DRAG_THRESHOLD = 50;

export function SwipeCarousel({
  cards = defaultCards,
}: {
  cards?: CarouselCard[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex < cards.length - 1;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    setActiveIndex(clamped);
    animate(x, -clamped * (CARD_WIDTH + CARD_GAP), {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > 500) {
      if (offset > 0 || velocity > 500) {
        goTo(activeIndex - 1);
      } else {
        goTo(activeIndex + 1);
      }
    } else {
      goTo(activeIndex);
    }
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport} ref={containerRef}>
        <motion.div
          className={styles.track}
          style={{ x }}
          drag="x"
          dragConstraints={{
            left: -(cards.length - 1) * (CARD_WIDTH + CARD_GAP),
            right: 0,
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          {cards.map((card, i) => {
            const distance = useTransform(x, (latest) => {
              const cardCenter = i * (CARD_WIDTH + CARD_GAP);
              return Math.abs(latest + cardCenter);
            });
            const scale = useTransform(distance, [0, CARD_WIDTH], [1, 0.92]);
            const opacity = useTransform(distance, [0, CARD_WIDTH * 1.5], [1, 0.5]);

            return (
              <motion.div
                key={i}
                className={styles.card}
                style={{ scale, opacity }}
                onClick={() => goTo(i)}
              >
                <div
                  className={styles.cardGradient}
                  style={{ background: card.gradient }}
                />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={styles.navButton}
          onClick={() => goTo(activeIndex - 1)}
          disabled={!canGoLeft}
          aria-label="Previous card"
        >
          <ChevronLeft size={18} />
        </button>
        <div className={styles.dots}>
          {cards.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>
        <button
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
