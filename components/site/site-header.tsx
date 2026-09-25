"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./site.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  // "page" only on the index itself; on a post, "Writing" is the current section.
  const onIndex = pathname === "/blog" || pathname === "/blog/";
  const inWriting = pathname.startsWith("/blog");

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.name}>
        Miguel Batalha
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link
          href="/blog/"
          className={styles.navLink}
          aria-current={onIndex ? "page" : inWriting ? "true" : undefined}
        >
          Writing
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
