import TheBoringComponents from "../_posts/the-boring-components";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("the-boring-components");

export default function Page() {
  return (
    <PostPage slug="the-boring-components">
      <TheBoringComponents />
    </PostPage>
  );
}
