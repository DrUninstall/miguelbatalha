"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { DemoPausedContext } from "@/components/demo-pause";
import styles from "./post.module.css";

/**
 * A live demo, framed the same way in every post. Demos that loop on their own
 * pass `loop`, which adds a pause toggle (WCAG 2.2.2): CSS loops freeze through
 * the `data-paused` rule in globals.css, JS loops read `useDemoPaused()`.
 */
export function Demo({
  caption,
  loop = false,
  children,
}: {
  caption?: ReactNode;
  loop?: boolean;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <figure className={styles.demo}>
      <div className={styles.stage} data-paused={loop && paused ? "true" : undefined}>
        <DemoPausedContext.Provider value={loop && paused}>{children}</DemoPausedContext.Provider>
        {loop && (
          <button
            type="button"
            className={styles.pause}
            aria-label="Pause animation"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
          </button>
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * A short code excerpt. `label` names the language or file. The block only
 * becomes a keyboard stop (a named region) when its lines actually overflow.
 */
export function Code({ children, label }: { children: string; label?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScrollable(el.scrollWidth > el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className={styles.code}>
      {label && <figcaption className={styles.codeLabel}>{label}</figcaption>}
      <pre
        ref={ref}
        {...(scrollable && {
          tabIndex: 0,
          role: "region",
          "aria-label": `${label ?? "Code"}, scrollable`,
        })}
      >
        <code>{children.trim()}</code>
      </pre>
    </figure>
  );
}
