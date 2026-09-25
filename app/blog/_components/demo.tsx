import type { ReactNode } from "react";
import styles from "./post.module.css";

/** A live demo, framed the same way in every post. */
export function Demo({
  caption,
  children,
}: {
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className={styles.demo}>
      <div className={styles.stage}>{children}</div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

/** A short code excerpt. `label` names the language or file. */
export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <figure className={styles.code}>
      {label && <figcaption className={styles.codeLabel}>{label}</figcaption>}
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre tabIndex={0}>
        <code>{children.trim()}</code>
      </pre>
    </figure>
  );
}
