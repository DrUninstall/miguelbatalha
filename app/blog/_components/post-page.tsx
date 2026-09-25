import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ReducedMotionProvider } from "@/components/reduced-motion-provider";
import site from "@/components/site/site.module.css";
import { formatDate } from "@/lib/utils";
import { blogPosts, getPostBySlug } from "../_data/posts";
import styles from "./post-page.module.css";
import prose from "./post.module.css";

function getPost(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) throw new Error(`Unknown post: ${slug}`);
  return post;
}

export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  const url = `/blog/${slug}/`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ["Miguel Batalha"],
      images: [{ url: `/og/${slug}.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/og/${slug}.png`],
    },
  };
}

/** The frame every post renders in. Each post is its own route, so each ships only its own demos. */
export function PostPage({ slug, children }: { slug: string; children: ReactNode }) {
  const post = getPost(slug);
  const index = blogPosts.findIndex((p) => p.slug === slug);
  const next = blogPosts[index + 1];

  return (
    <main className={site.page}>
      <article>
        <header className={styles.postHeader}>
          <Link href="/blog/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Writing
          </Link>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <time className={styles.postDate} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        </header>

        <ReducedMotionProvider>
          <div className={prose.prose}>{children}</div>
        </ReducedMotionProvider>
      </article>

      <nav className={styles.more} aria-label="More writing">
        {next && (
          <Link href={`/blog/${next.slug}/`} className={styles.next}>
            <span className={styles.nextLabel}>Next</span>
            <span className={styles.nextTitle}>{next.title}</span>
          </Link>
        )}
        <Link href="/blog/" className={styles.all}>
          All writing <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </main>
  );
}
