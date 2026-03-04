import Link from "next/link";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            &copy; 2026 Miguel Batalha. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link
              href="https://www.linkedin.com/in/miguelbatalha"
              target="_blank"
              className={styles.footerLink}
            >
              LinkedIn
            </Link>
            <Link
              href="https://github.com/druninstall"
              target="_blank"
              className={styles.footerLink}
            >
              GitHub
            </Link>
            <Link
              href="mailto:miguelbatalhamusic@gmail.com"
              className={styles.footerLink}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
