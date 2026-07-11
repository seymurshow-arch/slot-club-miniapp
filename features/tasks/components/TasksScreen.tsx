import styles from "./TasksScreen.module.css";

const tasks = [
  {
    id: 1,
    icon: "👆",
    title: "Make 500 taps",
    description: "Tap the Club button 500 times",
    progress: 340,
    target: 500,
    reward: "2.5K",
    status: "active",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Use 1,000 energy",
    description: "Spend energy by tapping",
    progress: 1_000,
    target: 1_000,
    reward: "5K",
    status: "completed",
  },
  {
    id: 3,
    icon: "🛍",
    title: "Buy an upgrade",
    description: "Purchase any item in the Shop",
    progress: 0,
    target: 1,
    reward: "3K",
    status: "active",
  },
  {
    id: 4,
    icon: "👥",
    title: "Invite a friend",
    description: "Invite one new player",
    progress: 0,
    target: 1,
    reward: "10K",
    status: "active",
  },
];

function getProgress(progress: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (progress / target) * 100));
}

export function TasksScreen() {
  return (
    <section className={styles.screen}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Missions</span>

          <h1 className={styles.title}>Complete tasks</h1>

          <p className={styles.description}>
            Finish missions and collect rewards.
          </p>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2>Tasks</h2>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => {
          const progressPercent = getProgress(
            task.progress,
            task.target
          );

          const isCompleted = task.status === "completed";

          return (
            <article
              key={task.id}
              className={`${styles.taskCard} ${
                isCompleted ? styles.completed : ""
              }`}
            >
              <div className={styles.taskIcon}>
                {task.icon}
              </div>

              <div className={styles.taskContent}>
                <div className={styles.taskTop}>
                  <div className={styles.taskTitleBlock}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>

                  <div className={styles.reward}>
                    <span className={styles.rewardCoin} />
                    <strong>{task.reward}</strong>
                  </div>
                </div>

                <div className={styles.progressInfo}>
                  <span>
                    {task.progress.toLocaleString("en-US")} /{" "}
                    {task.target.toLocaleString("en-US")}
                  </span>

                  <strong>
                    {Math.round(progressPercent)}%
                  </strong>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                className={`${styles.taskButton} ${
                  isCompleted ? styles.claimButton : ""
                }`}
              >
                {isCompleted ? "Claim" : "Go"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}