import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import site from "@/components/site/site.module.css";
import list from "@/components/site/list.module.css";
import { blogPosts } from "./_data/posts";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on interface design, motion, and the details that make interfaces hold up.",
  alternates: { canonical: "/blog/" },
};

export default function BlogPage() {
  return (
    <main className={site.page}>
      <h1 className={styles.title}>Writing</h1>
      <p className={styles.lede}>
        Notes on interface design and motion. Every post includes the live
        components it describes.
      </p>

      <ul className={`${list.list} ${styles.posts}`}>
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}/`}
              className={`${list.row} ${list.interactive} ${styles.postRow}`}
            >
              <span className={styles.entry}>
                <span className={styles.entryTitle}>{post.title}</span>
                <span className={styles.entryDescription}>
                  {post.description}
                </span>
              </span>
              <time className={list.meta} dateTime={post.date}>
                {formatDate(post.date, "short")}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
