import { useState, useEffect, useCallback } from "react";

interface Size {
  width: number;
  height: number;
}

export function useMeasure<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setSize({ width, height });
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [node]);

  return [ref, size] as const;
}
