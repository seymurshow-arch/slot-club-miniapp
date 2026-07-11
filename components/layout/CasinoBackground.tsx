import styles from "./CasinoBackground.module.css";

type CasinoBackgroundProps = {
  children: React.ReactNode;
};

export function CasinoBackground({
  children,
}: CasinoBackgroundProps) {
  return (
    <div className={styles.background}>
      <div className={styles.glowTop} />
      <div className={styles.glowCenter} />
      <div className={styles.glowBottom} />

      <div className={styles.pattern} />

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}