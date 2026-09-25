import DesigningForThePointer from "../_posts/designing-for-the-pointer";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("designing-for-the-pointer");

export default function Page() {
  return (
    <PostPage slug="designing-for-the-pointer">
      <DesigningForThePointer />
    </PostPage>
  );
}
