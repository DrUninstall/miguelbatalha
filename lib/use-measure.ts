import { useState, useEffect, useCallback } from "react";

interface Size {
  width: number;
  height: number;
}

/**
 * Measures an element's border-box size and keeps it up to date with a
 * ResizeObserver. Uses layout sizes (offsetWidth/borderBoxSize) rather than
 * getBoundingClientRect, so a CSS/framer transform on an ancestor (e.g. a
 * dialog scaling in from 0.95) doesn't shrink the measurement.
 */
export function useMeasure<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const set = (width: number, height: number) =>
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );

    const resizeObserver = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      if (box) set(box.inlineSize, box.blockSize);
      else set(node.offsetWidth, node.offsetHeight);
    });
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [node]);

  return [ref, size] as const;
}
