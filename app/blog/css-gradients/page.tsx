import CssGradients from "../_posts/css-gradients";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("css-gradients");

export default function Page() {
  return (
    <PostPage slug="css-gradients">
      <CssGradients />
    </PostPage>
  );
}
