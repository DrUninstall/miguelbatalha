import { blogPosts } from "../_data/posts";

export const dynamic = "force-static";

const origin = "https://miguelbatalha.com";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = blogPosts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${origin}/blog/${post.slug}</link>
      <guid>${origin}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Miguel Batalha — Writing</title>
    <link>${origin}/blog</link>
    <description>Notes on interface design, motion, and building products.</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
