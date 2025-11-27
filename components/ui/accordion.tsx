"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./accordion.module.css";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  shouldAutoExpand?: boolean;
  collapseAll?: boolean;
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  shouldAutoExpand = false,
  collapseAll = false,
  onToggle,
  disabled = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (shouldAutoExpand && !isOpen) {
      setIsOpen(true);
      onToggle?.(true);
    }
  }, [shouldAutoExpand, isOpen, onToggle]);

  useEffect(() => {
    if (collapseAll && isOpen) {
      setIsOpen(false);
      onToggle?.(false);
    }
  }, [collapseAll, isOpen, onToggle]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={styles.item}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={styles.button}
        aria-expanded={isOpen ? "true" : "false"}
        aria-disabled={disabled ? "true" : "false"}
      >
        <h3 className={styles.title}>{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChevronDown className={styles.iconWrapper} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={styles.content}
          >
            <div className={styles.contentInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className = "" }: AccordionProps) {
  return (
    <div className={`${styles.accordion} ${className}`}>
      {children}
    </div>
  );
}
