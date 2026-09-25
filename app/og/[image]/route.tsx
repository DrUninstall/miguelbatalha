import { blogPosts, getPostBySlug } from "../../blog/_data/posts";
import { renderOg } from "../../_og/og";

// Share images are emitted as real .png files (out/og/<name>.png) so GitHub
// Pages serves them as image/png, which link previews require.
export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ image: "site.png" }, ...blogPosts.map((p) => ({ image: `${p.slug}.png` }))];
}

export async function GET(_: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params;
  const post = getPostBySlug(image.replace(/\.png$/, ""));
  return post
    ? renderOg(post.title, "Writing")
    : renderOg("Head of Product & Strategy at KovaaK Games", "miguelbatalha.com");
}
