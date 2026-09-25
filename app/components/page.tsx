import type { Metadata } from "next";
import Link from "next/link";
import site from "@/components/site/site.module.css";

// /components was a demo showcase; every demo now lives in a blog post.
// GitHub Pages can't send a 301, so this page refreshes to the writing index
// (React hoists the <meta> into <head>) and links there for anyone it doesn't.
export const metadata: Metadata = {
  title: "Moved",
  robots: { index: false },
  alternates: { canonical: "/blog/" },
};

export default function ComponentsMoved() {
  return (
    <main className={site.page}>
      <meta httpEquiv="refresh" content="0; url=/blog/" />
      <p>
        The components page has moved into the blog posts.{" "}
        <Link href="/blog/">Go to Writing</Link>.
      </p>
    </main>
  );
}
