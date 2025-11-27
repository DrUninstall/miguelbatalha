import styles from "./orbit-animation.module.css";

export function OrbitAnimation() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.circle} />
      <div className={styles.orbitingCircle} />
    </div>
  );
}
