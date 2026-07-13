import styles from "../../AdminPanel.module.css";

type ActiveTasksViewProps = {
  onCreateTask: () => void;
};

export function ActiveTasksView({
  onCreateTask,
}: ActiveTasksViewProps) {
  return (
    <section className={styles.activeTasksView}>
      <div className={styles.tasksStatsGrid}>
        <article>
          <span>All tasks</span>
          <strong>0</strong>
          <small>Усі створені завдання</small>
        </article>

        <article>
          <span>Active</span>
          <strong>0</strong>
          <small>Доступні гравцям</small>
        </article>

        <article>
          <span>Disabled</span>
          <strong>0</strong>
          <small>Тимчасово вимкнені</small>
        </article>

        <article>
          <span>Completions</span>
          <strong>—</strong>
          <small>Механіка ще не підключена</small>
        </article>
      </div>

      <article className={styles.tasksListCard}>
        <header className={styles.tasksListHeader}>
          <div>
            <h2>Task Management</h2>
            <p>
              Керування активними, вимкненими та завершеними
              завданнями
            </p>
          </div>

          <div className={styles.tasksListActions}>
            <label className={styles.tasksSearch}>
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search tasks..."
                disabled
              />
            </label>

            <select
              className={styles.tasksFilterSelect}
              disabled
              defaultValue="all"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </header>

        <div className={styles.tasksEmptyState}>
          <span className={styles.tasksEmptyIcon}>✓</span>

          <strong>No tasks created yet</strong>

          <p>
            Після підключення Tasks до PostgreSQL тут з’являться
            створені завдання, їхній статус, аудиторія та кількість
            виконань.
          </p>

          <button type="button" onClick={onCreateTask}>
            <span>+</span>
            Create first task
          </button>
        </div>
      </article>
    </section>
  );
}