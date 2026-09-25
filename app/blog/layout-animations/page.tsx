import LayoutAnimations from "../_posts/layout-animations";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("layout-animations");

export default function Page() {
  return (
    <PostPage slug="layout-animations">
      <LayoutAnimations />
    </PostPage>
  );
}
