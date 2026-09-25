import MotionFoundations from "../_posts/motion-foundations";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("motion-foundations");

export default function Page() {
  return (
    <PostPage slug="motion-foundations">
      <MotionFoundations />
    </PostPage>
  );
}
