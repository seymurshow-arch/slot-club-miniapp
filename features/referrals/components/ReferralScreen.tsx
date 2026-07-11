"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ReferralScreen.module.css";

type TelegramUser = {
  id: number;
  first_name?: string;
  username?: string;
};

type ReferralPlayer = {
  id: number;
  name: string;
  username?: string;
  reward: number;
};

const referrals: ReferralPlayer[] = [];

const INVITE_REWARD = 5_000;

export function ReferralScreen() {
  const [telegramUser, setTelegramUser] =
    useState<TelegramUser | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const telegram = (
      window as typeof window & {
        Telegram?: {
          WebApp?: {
            ready?: () => void;
            initDataUnsafe?: {
              user?: TelegramUser;
            };
          };
        };
      }
    ).Telegram?.WebApp;

    telegram?.ready?.();

    const user = telegram?.initDataUnsafe?.user;

    if (user) {
      setTelegramUser(user);
    }
  }, []);

  const referralLink = useMemo(() => {
    const botUsername =
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
      "SlotClubBot";

    const referralCode = telegramUser?.id
      ? `ref_${telegramUser.id}`
      : "ref_player";

    return `https://t.me/${botUsername}?start=${referralCode}`;
  }, [telegramUser]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      const textArea = document.createElement("textarea");

      textArea.value = referralLink;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.select();

      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    }
  }

  return (
    <section className={styles.screen}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Referral</span>

        <h1 className={styles.title}>Invite friends</h1>

        <p className={styles.description}>
          Share your personal link, invite new players and
          receive rewards.
        </p>
      </div>

      <div className={styles.rewardCard}>
        <div className={styles.rewardGlow} />

        <div className={styles.rewardIcon}>🪙</div>

        <div className={styles.rewardContent}>
          <span>Reward for each friend</span>

          <strong>
            +{INVITE_REWARD.toLocaleString("en-US")} coins
          </strong>

          <p>
            The reward will be added after your invited friend
            joins the game through your personal link.
          </p>
        </div>

        <div className={styles.rewardBadge}>
          Per friend
        </div>
      </div>

      <div className={styles.linkCard}>
        <div className={styles.cardGlow} />

        <div className={styles.linkHeader}>
          <div className={styles.linkIcon}>🔗</div>

          <div className={styles.linkHeading}>
            <span>Your referral link</span>
            <strong>Share and invite</strong>
          </div>
        </div>

        <div className={styles.linkBox}>
          <div className={styles.linkText}>
            {referralLink}
          </div>

          <button
            type="button"
            className={`${styles.copyButton} ${
              copied ? styles.copiedButton : ""
            }`}
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoIcon}>🎁</div>

        <div className={styles.infoContent}>
          <h2>How it works</h2>

          <p>
            Copy your personal link and send it to a friend.
            When the player opens the game using your link,
            they will appear in your referral list and you
            will receive your invite reward.
          </p>
        </div>
      </div>

      <div className={styles.referralsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your referrals</h2>

          <span>{referrals.length}</span>
        </div>

        {referrals.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>

            <h3>No referrals yet</h3>

            <p>
              Invited players will appear here after opening
              the game through your personal link.
            </p>
          </div>
        ) : (
          <div className={styles.referralList}>
            {referrals.map((referral) => (
              <article
                key={referral.id}
                className={styles.referralCard}
              >
                <div className={styles.avatar}>
                  {referral.name.charAt(0).toUpperCase()}
                </div>

                <div className={styles.referralInfo}>
                  <strong>{referral.name}</strong>

                  <span>
                    {referral.username
                      ? `@${referral.username}`
                      : "Telegram player"}
                  </span>
                </div>

                <div className={styles.referralReward}>
                  <span>Reward</span>

                  <strong>
                    +{referral.reward.toLocaleString("en-US")}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}