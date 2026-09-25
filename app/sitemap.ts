import type { MetadataRoute } from "next";
import { blogPosts } from "./blog/_data/posts";

export const dynamic = "force-static";

const origin = "https://miguelbatalha.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${origin}/` },
    { url: `${origin}/blog/` },
    ...blogPosts.map((post) => ({
      url: `${origin}/blog/${post.slug}/`,
      lastModified: post.date,
    })),
  ];
}
