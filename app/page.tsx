"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

// Animation variants per DESIGN_SYSTEM.md
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] as const }
  }
};

const timelineItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] as const }
  }
};

// Timeline data
const timelineData = [
  {
    year: "2024 - Present",
    title: "Head of Product & Strategy",
    company: "KovaaK Games",
    bullets: [
      "Define and execute product strategies that drive growth and engagement",
      "Collaborate closely with the CEO to inform critical product and business decisions",
      "Develop UI/UX systems that improve user satisfaction, acquisition and retention",
      "Oversee team alignment, financial planning, and internal processes",
      "Contribute to product development through web apps, AI workflows, Discord Bots, and Unreal Engine"
    ]
  },
  {
    year: "2021 - 2024",
    title: "Senior Product Manager",
    company: "The Meta",
    bullets: [
      "Created design documents, UI/UX mockups and coordinated with engineering",
      "Identified product enhancements to improve UX, ROI, and product appeal",
      "Designed gameplay and maps for product and partners, including pro esports teams",
      "Communicated vision and value of new products; assisted with roadmap prioritization"
    ]
  },
  {
    year: "2020 - 2021",
    title: "Product Marketing Manager",
    company: "The Meta",
    bullets: [
      "Analyzed community feedback, competitor trends, and user data for high-ROI features",
      "Contributed to product design and implementation, including UI/UX improvements",
      "Identified and advocated influencer activities to improve audience growth"
    ]
  },
  {
    year: "2019 - 2023",
    title: "Marketing & Design Consultant",
    company: "Freelance",
    bullets: [
      "Consulted for audio and gaming clients: Stam Audio, KHE Audio, Golden Age Project, Fuse Audio Labs, ALOFT Gaming"
    ]
  },
  {
    year: "2016 - 2020",
    title: "Product Marketing Manager",
    company: "Stam Audio Engineering",
    bullets: [
      "Negotiated with retailers and manufacturers to ensure product standards",
      "Managed artist relations, press/media outreach, and event coordination",
      "Oversaw product design (aesthetics and functionality)",
      "Handled social media, newsletters, and customer support"
    ]
  }
];

// Timeline Item Component - Click accordion
function TimelineItem({
  item,
  index,
  isActive,
  onToggle
}: {
  item: typeof timelineData[0];
  index: number;
  isActive: boolean;
  onToggle: (index: number | null) => void;
}) {
  return (
    <motion.div
      className={styles.timelineItem}
      variants={timelineItemVariants}
      onClick={() => onToggle(isActive ? null : index)}
    >
      <motion.div
        className={styles.timelineDot}
        animate={{ scale: isActive ? 1.2 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <span className={styles.timelineYear}>{item.year}</span>
      <div className={styles.timelineContent}>
        <h3 className={styles.timelineTitle}>
          {item.title}
          <span className={styles.timelineSeparator}>·</span>
          <span className={styles.timelineCompany}>{item.company}</span>
        </h3>
      </div>

      {/* Expandable bullets */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={styles.timelineBullets}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <ul>
              {item.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

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
            <Link href="/components" className={styles.navLink}>
              Components
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={styles.heroWrapper}>
        <section className={styles.hero}>
          <motion.div
          className={styles.heroContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className={styles.heroTitle} variants={itemVariants}>
            Head of Product & Strategy
          </motion.h1>
          <motion.p className={styles.heroDescription} variants={itemVariants}>
            I run Product & Strategy at KovaaK Games, guiding roadmap, design, development, budgets, and day-to-day execution. I'm hands-on across UI/UX, design docs, feature specs, prototyping, and technical implementation.
          </motion.p>
          <motion.div className={styles.heroActions} variants={itemVariants}>
            <Link
              href="https://www.linkedin.com/in/miguelbatalha"
              target="_blank"
              className={styles.primaryButton}
            >
              Connect on LinkedIn
              <ArrowRight size={16} />
            </Link>
            <Button
              variant="secondary"
              tone="neutral"
              onClick={scrollToWork}
            >
              View Work
            </Button>
          </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Work Experience Section - Timeline */}
      <section id="work" className={styles.work}>
        <motion.h2
          className={styles.workTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        >
          Experience
        </motion.h2>
        <motion.div
          className={styles.timeline}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {timelineData.map((item, index) => (
            <TimelineItem
              key={index}
              item={item}
              index={index}
              isActive={activeItem === index}
              onToggle={setActiveItem}
            />
          ))}
        </motion.div>
      </section>

      {/* Education Section - Compact */}
      <section id="education" className={styles.education}>
        <motion.h2
          className={styles.educationTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        >
          Education
        </motion.h2>
        <motion.div
          className={styles.educationGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className={styles.educationCard} variants={itemVariants}>
            <p className={styles.educationDegree}>AI & Data for Business</p>
            <p className={styles.educationSchool}>Nova SBE</p>
            <p className={styles.educationDate}>2025 - 2026</p>
          </motion.div>
          <motion.div className={styles.educationCard} variants={itemVariants}>
            <p className={styles.educationDegree}>Applied Management</p>
            <p className={styles.educationSchool}>Nova SBE</p>
            <p className={styles.educationDate}>2024 - 2025</p>
          </motion.div>
          <motion.div className={styles.educationCard} variants={itemVariants}>
            <p className={styles.educationDegree}>Audio Science & Technology</p>
            <p className={styles.educationSchool}>Lusófona</p>
            <p className={styles.educationDate}>2014 - 2017</p>
          </motion.div>
        </motion.div>
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
