import Link from "next/link";
import site from "@/components/site/site.module.css";
import styles from "./not-found.module.css";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className={site.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.lede}>
        This address doesn’t match anything here. It may have moved when the
        site was rebuilt.
      </p>
      <p className={styles.links}>
        <Link href="/">Home</Link>
        <Link href="/blog/">Writing</Link>
      </p>
    </main>
  );
}
