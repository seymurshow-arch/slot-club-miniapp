import styles from "../../AdminPanel.module.css";

const services = [
  {
    name: "PostgreSQL",
    description: "Neon database connection",
    status: "Connected",
    ready: true,
  },
  {
    name: "Prisma",
    description: "Database ORM and Prisma Client",
    status: "Connected",
    ready: true,
  },
  {
    name: "Admin Authentication",
    description: "Password and browser session cookie",
    status: "Active",
    ready: true,
  },
  {
    name: "Telegram Bot API",
    description: "Tasks verification and notifications",
    status: "Pending",
    ready: false,
  },
  {
    name: "Game State",
    description: "Server-side balance and energy storage",
    status: "Pending",
    ready: false,
  },
  {
    name: "Analytics Events",
    description: "Statistics and economy tracking",
    status: "Pending",
    ready: false,
  },
];

export function SystemSettingsView() {
  return (
    <section className={styles.settingsView}>
      <div className={styles.systemStatusGrid}>
        {services.map((service) => (
          <article key={service.name}>
            <span
              className={
                service.ready
                  ? styles.systemServiceReady
                  : styles.systemServicePending
              }
            >
              {service.ready ? "✓" : "○"}
            </span>

            <div>
              <strong>{service.name}</strong>
              <p>{service.description}</p>
            </div>

            <b
              className={
                service.ready
                  ? styles.systemStatusReady
                  : styles.systemStatusPending
              }
            >
              {service.status}
            </b>
          </article>
        ))}
      </div>

      <div className={styles.systemSettingsGrid}>
        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Application Information</h2>
              <p>Поточне середовище та версії</p>
            </div>
          </header>

          <div className={styles.systemInformationList}>
            <div>
              <span>Application</span>
              <strong>Slot Club Mini App</strong>
            </div>

            <div>
              <span>Framework</span>
              <strong>Next.js 16</strong>
            </div>

            <div>
              <span>Database</span>
              <strong>Neon PostgreSQL</strong>
            </div>

            <div>
              <span>ORM</span>
              <strong>Prisma</strong>
            </div>

            <div>
              <span>Hosting</span>
              <strong>Vercel</strong>
            </div>

            <div>
              <span>Environment</span>
              <strong>Development / Production</strong>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>System Tools</h2>
              <p>Технічні адміністративні операції</p>
            </div>
          </header>

          <div className={styles.systemToolsList}>
            <button type="button" disabled>
              <span>↻</span>

              <div>
                <strong>Check connections</strong>
                <small>
                  Перевірити PostgreSQL, Prisma та Telegram
                </small>
              </div>
            </button>

            <button type="button" disabled>
              <span>⌁</span>

              <div>
                <strong>Clear server cache</strong>
                <small>
                  Оновити кеш конфігурації гри
                </small>
              </div>
            </button>

            <button type="button" disabled>
              <span>⇩</span>

              <div>
                <strong>Export data</strong>
                <small>
                  Експорт гравців і адміністративних даних
                </small>
              </div>
            </button>

            <button type="button" disabled>
              <span>◆</span>

              <div>
                <strong>Create backup</strong>
                <small>
                  Резервна копія критичних даних
                </small>
              </div>
            </button>
          </div>
        </article>
      </div>

      <article className={styles.systemEnvironmentNotice}>
        <span>!</span>

        <div>
          <strong>Environment variables are protected</strong>

          <p>
            DATABASE_URL, ADMIN_PASSWORD, Telegram Bot Token та
            секрети сесій не повинні відображатися в адмінці.
            Тут показується лише статус їхньої конфігурації.
          </p>
        </div>
      </article>
    </section>
  );
}