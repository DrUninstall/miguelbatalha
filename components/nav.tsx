"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./nav.module.css";

const NAV_ITEMS = [
  { href: "/#work", label: "Work" },
  { href: "/components", label: "Components" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          Miguel Batalha
        </Link>
        <div className={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/#work"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? styles.navLinkActive : styles.navLink}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    className={styles.navUnderline}
                    layoutId="nav-underline"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
