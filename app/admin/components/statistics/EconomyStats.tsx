import styles from "../../AdminPanel.module.css";

export function EconomyStats() {
  return (
    <section className={styles.economyStatistics}>
      <div className={styles.statisticsMetricsGrid}>
        <article>
          <span>Coins created</span>
          <strong>—</strong>
          <small>Усі джерела монет</small>
        </article>

        <article>
          <span>Coins spent</span>
          <strong>—</strong>
          <small>Shop та інші витрати</small>
        </article>

        <article>
          <span>Total player balance</span>
          <strong>—</strong>
          <small>Баланс усіх гравців</small>
        </article>

        <article>
          <span>Average balance</span>
          <strong>—</strong>
          <small>Середній баланс акаунта</small>
        </article>
      </div>

      <div className={styles.economyStatisticsGrid}>
        <article className={styles.statisticsChartCard}>
          <header>
            <div>
              <h2>Coins Sources</h2>

              <p>Звідки гравці отримують монети</p>
            </div>
          </header>

          <div className={styles.statisticsSourcePlaceholder}>
            <span>+</span>

            <strong>No economy events yet</strong>

            <p>
              Тут буде розподіл монет між тапами, Tasks, Daily
              Rewards, Referral, VIP і ручними нагородами.
            </p>
          </div>
        </article>

        <article className={styles.statisticsChartCard}>
          <header>
            <div>
              <h2>Coins Spending</h2>

              <p>На що гравці витрачають монети</p>
            </div>
          </header>

          <div className={styles.statisticsSourcePlaceholder}>
            <span>−</span>

            <strong>No spending events yet</strong>

            <p>
              Тут буде розподіл витрат між апгрейдами, енергією,
              косметикою та спеціальними товарами.
            </p>
          </div>
        </article>
      </div>

      <article className={styles.economyWarningCard}>
        <span>!</span>

        <div>
          <strong>Economy monitoring is not connected</strong>

          <p>
            Після перенесення game state у PostgreSQL кожна зміна
            балансу повинна створювати серверну транзакцію. Без
            журналу транзакцій неможливо точно аналізувати економіку
            та знаходити зловживання.
          </p>
        </div>
      </article>
    </section>
  );
}