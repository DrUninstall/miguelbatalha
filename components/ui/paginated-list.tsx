"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import styles from "./paginated-list.module.css";

interface PaginatedListProps<T> {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function PaginatedList<T>({
  items,
  itemsPerPage = 10,
  renderItem,
  emptyState,
  className = "",
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`${styles.itemsContainer} ${className}`}>
      {/* Items list */}
      <div className={styles.itemsList}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              duration: 0.2,
              ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
            }}
          >
            {currentItems.map((item, index) => (
              <div key={index}>{renderItem(item, (currentPage - 1) * itemsPerPage + index)}</div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          {/* Page info */}
          <p className={styles.pageInfo}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, items.length)} of {items.length} items
          </p>

          {/* Page controls */}
          <div className={styles.controls}>
            {/* First page */}
            <IconButton
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              size="small"
              aria-label="First page"
            >
              <ChevronsLeft className={styles.icon} />
            </IconButton>

            {/* Previous page */}
            <IconButton
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              size="small"
              aria-label="Previous page"
            >
              <ChevronLeft className={styles.icon} />
            </IconButton>

            {/* Page numbers */}
            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={index}
                    onClick={() => goToPage(page)}
                    variant={currentPage === page ? "primary" : "tertiary"}
                    tone={currentPage === page ? "brand" : "neutral"}
                    size="small"
                    className={styles.pageButton}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className={styles.ellipsis}>
                    {page}
                  </span>
                )
              )}
            </div>

            {/* Next page */}
            <IconButton
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              size="small"
              aria-label="Next page"
            >
              <ChevronRight className={styles.icon} />
            </IconButton>

            {/* Last page */}
            <IconButton
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              size="small"
              aria-label="Last page"
            >
              <ChevronsRight className={styles.icon} />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
