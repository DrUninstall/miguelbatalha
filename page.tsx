import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            Miguel Batalha
          </Link>
          <div className={styles.navLinks}>
            <Link href="#work" className={styles.navLink}>
              Work
            </Link>
            <Link href="/blog" className={styles.navLink}>
              Blog
            </Link>
            <Link href="/components" className={styles.navLink}>
              Components
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Head of Product & Strategy
          </h1>
          <p className={styles.heroDescription}>
            I run Product & Strategy at KovaaK Games, where I guide roadmap, design, development, and execution.
            Previously Marketing, now hands-on across UI/UX, technical implementation, and strategic decision-making.
          </p>
          <div className={styles.heroActions}>
            <Link
              href="https://www.linkedin.com/in/miguelbatalha"
              target="_blank"
              className={styles.primaryButton}
            >
              Connect on LinkedIn
              <ArrowRight className={styles.icon} />
            </Link>
            <Link
              href="#work"
              className={styles.secondaryButton}
            >
              View Work
            </Link>
          </div>
        </div>
      </section>

      {/* Work Experience Section */}
      <section id="work" className={styles.work}>
        <h2 className={styles.workTitle}>Experience</h2>
        <div className={styles.workList}>
          {/* KovaaK Games */}
          <div>
            <div className={styles.jobHeader}>
              <div>
                <h3 className={styles.jobTitle}>Head of Product & Strategy</h3>
                <p className={styles.jobCompany}>KovaaK Games</p>
              </div>
              <span className={styles.jobDate}>Jan 2024 - Present</span>
            </div>
            <ul className={styles.jobList}>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Lead cross-functional responsibilities including team management, budget forecasting, project management, partnerships and growth strategy</span>
              </li>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Define and execute product strategies that drive growth and engagement across all platforms</span>
              </li>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Design and implement UI/UX systems using Figma for kovaaks.com, improving user satisfaction and retention</span>
              </li>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Contribute hands-on technical work: frontend development for kovaaks.com, backend bug fixes, Discord Bots, and Unreal Engine implementation</span>
              </li>
            </ul>
          </div>

          {/* The Meta */}
          <div>
            <div className={styles.jobHeader}>
              <div>
                <h3 className={styles.jobTitle}>Senior Product Manager</h3>
                <p className={styles.jobCompany}>The Meta</p>
              </div>
              <span className={styles.jobDate}>Sep 2021 - Feb 2024</span>
            </div>
            <ul className={styles.jobList}>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Created design documents and UI/UX mockups, coordinating with engineering from design to release</span>
              </li>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Designed gameplay and maps for product and partners, including pro esports players/teams</span>
              </li>
            </ul>
          </div>

          {/* Stam Audio */}
          <div>
            <div className={styles.jobHeader}>
              <div>
                <h3 className={styles.jobTitle}>Product Marketing Manager</h3>
                <p className={styles.jobCompany}>Stam Audio Engineering</p>
              </div>
              <span className={styles.jobDate}>Jul 2016 - 2020</span>
            </div>
            <ul className={styles.jobList}>
              <li className={styles.jobItem}>
                <span className={styles.bullet}>•</span>
                <span>Led international marketing campaigns and product design for audio equipment manufacturer</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              © 2025 Miguel Batalha. All rights reserved.
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
                href="mailto:miguelbatalhamusic@gmail.com"
                className={styles.footerLink}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
