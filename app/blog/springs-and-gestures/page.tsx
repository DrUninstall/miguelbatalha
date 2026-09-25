import SpringsAndGestures from "../_posts/springs-and-gestures";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("springs-and-gestures");

export default function Page() {
  return (
    <PostPage slug="springs-and-gestures">
      <SpringsAndGestures />
    </PostPage>
  );
}
