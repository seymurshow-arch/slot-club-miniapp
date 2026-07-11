import styles from "./VipScreen.module.css";

const vipLevels = [
  {
    level: 1,
    name: "Bronze",
    icon: "◆",
    requiredXp: 0,
    reward: "1K",
  },
  {
    level: 2,
    name: "Silver",
    icon: "◆",
    requiredXp: 5_000,
    reward: "3K",
  },
  {
    level: 3,
    name: "Gold",
    icon: "◆",
    requiredXp: 15_000,
    reward: "7.5K",
  },
  {
    level: 4,
    name: "Platinum",
    icon: "◆",
    requiredXp: 35_000,
    reward: "15K",
  },
  {
    level: 5,
    name: "Diamond",
    icon: "◆",
    requiredXp: 75_000,
    reward: "35K",
  },
];

const benefits = [
  {
    id: 1,
    icon: "⚡",
    title: "More energy",
    description: "Increase your maximum energy limit.",
  },
  {
    id: 2,
    icon: "💰",
    title: "Bigger rewards",
    description: "Receive larger rewards from missions.",
  },
  {
    id: 3,
    icon: "🎁",
    title: "VIP bonuses",
    description: "Unlock exclusive bonuses and gifts.",
  },
];

const currentVipLevel = 1;
const currentXp = 3_250;
const nextLevelXp = 5_000;

function getProgress(progress: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (progress / target) * 100));
}

export function VipScreen() {
  const progressPercent = getProgress(currentXp, nextLevelXp);

  return (
    <section className={styles.screen}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>VIP club</span>

        <h1 className={styles.title}>Your VIP status</h1>

        <p className={styles.description}>
          Earn VIP points, unlock new levels and receive
          exclusive rewards.
        </p>
      </div>

      <article className={styles.statusCard}>
        <div className={styles.statusGlow} />

        <div className={styles.statusTop}>
          <div className={styles.vipBadge}>
            <span>VIP</span>
            <strong>{currentVipLevel}</strong>
          </div>

          <div className={styles.statusInfo}>
            <span>Current level</span>
            <strong>Bronze member</strong>
            <small>
              {currentXp.toLocaleString("en-US")} VIP points
            </small>
          </div>

          <div className={styles.nextLevel}>
            <span>Next</span>
            <strong>VIP 2</strong>
          </div>
        </div>

        <div className={styles.progressInfo}>
          <span>
            {currentXp.toLocaleString("en-US")} /{" "}
            {nextLevelXp.toLocaleString("en-US")}
          </span>

          <strong>{Math.round(progressPercent)}%</strong>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </article>

      <div className={styles.sectionHeader}>
        <h2>VIP benefits</h2>
      </div>

      <div className={styles.benefitsGrid}>
        {benefits.map((benefit) => (
          <article
            key={benefit.id}
            className={styles.benefitCard}
          >
            <div className={styles.benefitIcon}>
              {benefit.icon}
            </div>

            <h3>{benefit.title}</h3>

            <p>{benefit.description}</p>
          </article>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h2>VIP levels</h2>
      </div>

      <div className={styles.levelList}>
        {vipLevels.map((vipLevel) => {
          const isCurrent =
            vipLevel.level === currentVipLevel;

          const isUnlocked =
            vipLevel.level <= currentVipLevel;

          return (
            <article
              key={vipLevel.level}
              className={`${styles.levelCard} ${
                isCurrent ? styles.currentLevel : ""
              } ${
                isUnlocked ? styles.unlockedLevel : ""
              }`}
            >
              <div className={styles.levelIcon}>
                {vipLevel.icon}
              </div>

              <div className={styles.levelInfo}>
                <span>VIP {vipLevel.level}</span>

                <strong>{vipLevel.name}</strong>

                <small>
                  {vipLevel.requiredXp === 0
                    ? "Starting level"
                    : `${vipLevel.requiredXp.toLocaleString(
                        "en-US"
                      )} points required`}
                </small>
              </div>

              <div className={styles.levelReward}>
                <span>Reward</span>
                <strong>{vipLevel.reward}</strong>
              </div>

              <div className={styles.levelStatus}>
                {isCurrent
                  ? "Current"
                  : isUnlocked
                    ? "Unlocked"
                    : "Locked"}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}