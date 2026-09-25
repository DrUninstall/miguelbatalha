import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "../_data/posts";
import { formatDate } from "@/lib/utils";
import site from "@/components/site/site.module.css";
import styles from "./page.module.css";

import postStyles from "../_components/post.module.css";

// Static imports so every post is prerendered by the static export.
import MotionFoundations from "../_posts/motion-foundations";
import SpringsAndGestures from "../_posts/springs-and-gestures";
import LayoutAnimations from "../_posts/layout-animations";
import DesigningForThePointer from "../_posts/designing-for-the-pointer";
import CssGradients from "../_posts/css-gradients";
import TheBoringComponents from "../_posts/the-boring-components";

const postComponents: Record<string, React.ComponentType> = {
  "motion-foundations": MotionFoundations,
  "springs-and-gestures": SpringsAndGestures,
  "layout-animations": LayoutAnimations,
  "designing-for-the-pointer": DesigningForThePointer,
  "css-gradients": CssGradients,
  "the-boring-components": TheBoringComponents,
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

        <div className={postStyles.prose}>
          <PostContent />
        </div>
      </article>
    </main>
  );
}
