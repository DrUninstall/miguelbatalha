"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./list.module.css";

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  className?: string;
}

export function List<T>({
  items,
  renderItem,
  itemHeight = 60,
  loadMore,
  hasMore = false,
  isLoading = false,
  emptyState,
  loadingState,
  className = "",
}: ListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate visible items based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + clientHeight) / itemHeight) + 5
    );

    setVisibleRange({ start, end });
  }, [items.length, itemHeight]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMore || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          try {
            await loadMore();
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={className}>
        {emptyState || (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  // Initial loading state
  if (items.length === 0 && isLoading) {
    return (
      <div className={className}>
        {loadingState || (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} aria-label="Loading content" />
          </div>
        )}
      </div>
    );
  }

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`${styles.listContainer} ${className}`}
      style={{ maxHeight: "600px" }}
    >
      {/* Virtual spacer */}
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        {/* Visible items */}
        <div
          style={{
            position: "absolute",
            top: `${offsetY}px`,
            width: "100%",
          }}
        >
          {items.slice(visibleRange.start, visibleRange.end).map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ minHeight: `${itemHeight}px` }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>

      {/* Infinite scroll loader */}
      {hasMore && (
        <div
          ref={loaderRef}
          className={styles.loaderContainer}
        >
          <Loader2 className={styles.loaderSpinner} aria-label="Loading more items" />
        </div>
      )}
    </div>
  );
}

// Simple non-virtualized list variant for small datasets
interface SimpleListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
  gap?: "none" | "small" | "medium" | "large";
}

export function SimpleList<T>({
  items,
  renderItem,
  emptyState,
  className = "",
  gap = "small",
}: SimpleListProps<T>) {
  const gapClasses = {
    none: styles.gapNone,
    small: styles.gapSmall,
    medium: styles.gapMedium,
    large: styles.gapLarge,
  };

  if (items.length === 0) {
    return (
      <div className={className}>
        {emptyState || (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.simpleList} ${gapClasses[gap]} ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05, // Stagger effect
            ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
          }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
}
