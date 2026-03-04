import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { blogPosts, getPostBySlug, getAllSlugs } from "../_data/posts";
import { formatDate } from "@/lib/utils";
import styles from "./page.module.css";

// Post component imports — static for tree-shaking with static export
import MotionFoundations from "../_posts/motion-foundations";
import LayoutAnimations from "../_posts/layout-animations";
import InteractiveButtons from "../_posts/interactive-buttons";
import CssGradients from "../_posts/css-gradients";
import CursorInteractions from "../_posts/cursor-interactions";
import AnimatedIcons from "../_posts/animated-icons";
import DragAndSpringPhysics from "../_posts/drag-and-spring-physics";
import DesignSystem from "../_posts/design-system";
import ThemingAndPolish from "../_posts/theming-and-polish";

const postComponents: Record<string, React.ComponentType> = {
  "motion-foundations": MotionFoundations,
  "layout-animations": LayoutAnimations,
  "interactive-buttons": InteractiveButtons,
  "css-gradients": CssGradients,
  "cursor-interactions": CursorInteractions,
  "animated-icons": AnimatedIcons,
  "drag-and-spring-physics": DragAndSpringPhysics,
  "design-system": DesignSystem,
  "theming-and-polish": ThemingAndPolish,
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Miguel Batalha`,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const PostContent = postComponents[slug];
  if (!PostContent) notFound();

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

      {/* Article */}
      <article className={styles.article}>
        <Link href="/blog" className={styles.backLink}>
          &larr; Back to Blog
        </Link>

        <header className={styles.postHeader}>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <div className={styles.postMeta}>
            <time className={styles.postDate}>{formatDate(post.date)}</time>
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <PostContent />
      </article>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              &copy; 2025 Miguel Batalha. All rights reserved.
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
