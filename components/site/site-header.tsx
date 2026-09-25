"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./site.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const inWriting = pathname.startsWith("/blog");

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.name}>
        Miguel Batalha
      </Link>
      <nav className={styles.nav} aria-label="Primary">
        <Link
          href="/blog"
          className={styles.navLink}
          aria-current={inWriting ? "page" : undefined}
        >
          Writing
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
