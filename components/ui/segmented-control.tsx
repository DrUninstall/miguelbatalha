"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import styles from "./segmented-control.module.css";

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "normal";
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = "normal",
  className = "",
}: SegmentedControlProps) {
  const [thumbStyle, setThumbStyle] = useState({ left: 0, width: 0 });
  const [isKeyboard, setIsKeyboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateThumbPosition = () => {
    const selectedButton = optionsRefs.current.get(value);
    if (selectedButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();

      setThumbStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  };

  useLayoutEffect(() => {
    updateThumbPosition();
  }, [value, options]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateThumbPosition);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const handleChange = (newValue: string, viaKeyboard = false) => {
    setIsKeyboard(viaKeyboard);
    onChange(newValue);
  };

  const containerClasses = [
    styles.container,
    size === "small" ? styles.small : styles.normal,
    className
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      role="radiogroup"
    >
      {/* Animated thumb */}
      <motion.div
        className={styles.thumb}
        initial={false}
        animate={{
          left: thumbStyle.left,
          width: thumbStyle.width,
        }}
        transition={
          isKeyboard
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 300,
                damping: 30,
              }
        }
        style={{
          willChange: "transform, width",
        }}
      />

      {/* Options */}
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        const optionClasses = [
          styles.option,
          isSelected ? styles.selected : styles.unselected,
          option.disabled && styles.disabled
        ].filter(Boolean).join(" ");

        return (
          <button
            key={option.value}
            ref={(el) => {
              if (el) optionsRefs.current.set(option.value, el);
            }}
            onClick={() => handleChange(option.value, false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleChange(option.value, true);
              }
            }}
            disabled={option.disabled}
            className={optionClasses}
            role="radio"
            aria-checked={isSelected ? "true" : "false"}
            aria-disabled={option.disabled ? "true" : "false"}
          >
            {Icon && <Icon className={styles.optionIcon} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
