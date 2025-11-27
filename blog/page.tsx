import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./page.module.css";

const blogPosts = [
  {
    slug: "product-strategy-at-scale",
    title: "Product Strategy at Scale: Lessons from KovaaK Games",
    description: "How we built a product roadmap that balances user needs, technical constraints, and business goals.",
    date: "2025-01-15",
  },
  {
    slug: "ui-ux-principles",
    title: "UI/UX Principles I Live By",
    description: "A collection of design principles that guide my approach to product development.",
    date: "2024-12-20",
  },
];

export default function BlogPage() {
  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            Miguel Batalha
          </Link>
          <div className={styles.navLinks}>
            <Link href="/#work" className={styles.navLink}>
              Work
            </Link>
            <Link href="/blog" className={styles.navLinkActive}>
              Blog
            </Link>
            <Link href="/components" className={styles.navLink}>
              Components
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Blog Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>
          Blog
        </h1>
        <p className={styles.description}>
          Thoughts on product strategy, design, and building great experiences.
        </p>
      </section>

      {/* Blog Posts */}
      <section className={styles.posts}>
        <div className={styles.postsList}>
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={styles.postLink}
            >
              <article className={styles.post}>
                <div className={styles.postHeader}>
                  <h2 className={styles.postTitle}>
                    {post.title}
                  </h2>
                  <time className={styles.postDate}>
                    {formatDate(post.date)}
                  </time>
                </div>
                <p className={styles.postDescription}>
                  {post.description}
                </p>
              </article>
            </Link>
          ))}
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
