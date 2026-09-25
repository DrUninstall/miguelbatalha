import styles from "./site.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Miguel Batalha</p>
    </footer>
  );
}
