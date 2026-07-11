import styles from "./LeaderboardScreen.module.css";

type LeaderboardPlayer = {
  id: number;
  name: string;
  username?: string;
  balance: number;
  vipLevel: number;
};

type LeaderboardScreenProps = {
  onBack: () => void;
};

const topPlayers: LeaderboardPlayer[] = [
  {
    id: 1,
    name: "Alex",
    username: "alexwin",
    balance: 1_250_000,
    vipLevel: 8,
  },
  {
    id: 2,
    name: "Michael",
    username: "mikeclub",
    balance: 980_500,
    vipLevel: 7,
  },
  {
    id: 3,
    name: "Sofia",
    username: "sofiax",
    balance: 815_200,
    vipLevel: 6,
  },
  {
    id: 4,
    name: "Daniel",
    username: "dannyspin",
    balance: 640_100,
    vipLevel: 5,
  },
  {
    id: 5,
    name: "Emma",
    username: "emmaluck",
    balance: 522_900,
    vipLevel: 4,
  },
  {
    id: 6,
    name: "Oliver",
    username: "oliverclub",
    balance: 410_300,
    vipLevel: 4,
  },
];

const currentPlayer = {
  position: 128,
  name: "Player",
  username: "player",
  balance: 12_500,
  vipLevel: 1,
};

function formatBalance(value: number): string {
  return value.toLocaleString("en-US");
}

export function LeaderboardScreen({
  onBack,
}: LeaderboardScreenProps) {
  const podiumPlayers = topPlayers.slice(0, 3);
  const remainingPlayers = topPlayers.slice(3);

  return (
    <section className={styles.screen}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
      >
        <span>←</span>
        Back to Club
      </button>

      <div className={styles.heading}>
        <div className={styles.headingTop}>
          <span className={styles.eyebrow}>Leaderboard</span>

          <span className={styles.allTimeBadge}>
            All time
          </span>
        </div>

        <h1 className={styles.title}>Top players</h1>

        <p className={styles.description}>
          Compete with other players and climb to the top.
        </p>
      </div>

      <div className={styles.podium}>
        {podiumPlayers.map((player, index) => {
          const position = index + 1;

          return (
            <article
              key={player.id}
              className={`${styles.podiumCard} ${
                position === 1 ? styles.firstPlace : ""
              } ${
                position === 2 ? styles.secondPlace : ""
              } ${
                position === 3 ? styles.thirdPlace : ""
              }`}
            >
              <div className={styles.podiumRank}>
                {position}
              </div>

              <div className={styles.podiumAvatar}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              <strong className={styles.podiumName}>
                {player.name}
              </strong>

              <span className={styles.podiumUsername}>
                {player.username
                  ? `@${player.username}`
                  : "Telegram player"}
              </span>

              <div className={styles.podiumVip}>
                VIP {player.vipLevel}
              </div>

              <div className={styles.podiumBalance}>
                <span className={styles.coin} />

                <strong>
                  {formatBalance(player.balance)}
                </strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <h2>Ranking</h2>

        <span>Top {topPlayers.length}</span>
      </div>

      <div className={styles.playerList}>
        {remainingPlayers.map((player, index) => {
          const position = index + 4;

          return (
            <article
              key={player.id}
              className={styles.playerCard}
            >
              <div className={styles.playerPosition}>
                {position}
              </div>

              <div className={styles.playerAvatar}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              <div className={styles.playerInfo}>
                <strong>{player.name}</strong>

                <span>
                  {player.username
                    ? `@${player.username}`
                    : "Telegram player"}
                </span>
              </div>

              <div className={styles.playerVip}>
                VIP {player.vipLevel}
              </div>

              <div className={styles.playerBalance}>
                <span className={styles.coin} />

                <strong>
                  {formatBalance(player.balance)}
                </strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <h2>Your position</h2>
      </div>

      <article className={styles.currentPlayerCard}>
        <div className={styles.currentGlow} />

        <div className={styles.playerPosition}>
          {currentPlayer.position}
        </div>

        <div className={styles.playerAvatar}>
          {currentPlayer.name.charAt(0).toUpperCase()}
        </div>

        <div className={styles.playerInfo}>
          <strong>{currentPlayer.name}</strong>

          <span>@{currentPlayer.username}</span>
        </div>

        <div className={styles.playerVip}>
          VIP {currentPlayer.vipLevel}
        </div>

        <div className={styles.playerBalance}>
          <span className={styles.coin} />

          <strong>
            {formatBalance(currentPlayer.balance)}
          </strong>
        </div>
      </article>
    </section>
  );
}