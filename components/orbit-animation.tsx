import styles from "./orbit-animation.module.css";

export function OrbitAnimation() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.ring} />
      <div className={styles.planet} />
      <div className={styles.moon} />
    </div>
  );
}
