import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "../_data/posts";
import { formatDate } from "@/lib/utils";
import site from "@/components/site/site.module.css";
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
    title: post.title,
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
    <main className={site.page}>
      <article>
        <header className={styles.postHeader}>
          <Link href="/blog" className={styles.backLink}>
            <span aria-hidden="true">←</span> Writing
          </Link>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <time className={styles.postDate} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        </header>

        <PostContent />
      </article>
    </main>
  );
}
