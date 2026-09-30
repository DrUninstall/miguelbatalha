import InterfaceSounds from "../_posts/interface-sounds";
import { PostPage, postMetadata } from "../_components/post-page";

export const metadata = postMetadata("interface-sounds");

export default function Page() {
  return (
    <PostPage slug="interface-sounds">
      <InterfaceSounds />
    </PostPage>
  );
}
