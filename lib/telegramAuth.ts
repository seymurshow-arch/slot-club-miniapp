import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60;

type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type ValidatedTelegramInitData = {
  user: TelegramWebAppUser;
  authDate: Date;
  queryId?: string;
};

export class TelegramAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramAuthError";
  }
}

function createDataCheckString(params: URLSearchParams): string {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function signaturesMatch(receivedHash: string, calculatedHash: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return false;
  }

  const receivedBuffer = Buffer.from(receivedHash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  return (
    receivedBuffer.length === calculatedBuffer.length &&
    timingSafeEqual(receivedBuffer, calculatedBuffer)
  );
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS,
): ValidatedTelegramInitData {
  if (!initData) {
    throw new TelegramAuthError("Telegram initData is missing.");
  }

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");

  if (!receivedHash) {
    throw new TelegramAuthError("Telegram hash is missing.");
  }

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(createDataCheckString(params))
    .digest("hex");

  if (!signaturesMatch(receivedHash, calculatedHash)) {
    throw new TelegramAuthError("Telegram initData signature is invalid.");
  }

  const authDateValue = params.get("auth_date");
  const authDateSeconds = Number(authDateValue);

  if (!authDateValue || !Number.isSafeInteger(authDateSeconds)) {
    throw new TelegramAuthError("Telegram auth_date is invalid.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ageSeconds = nowSeconds - authDateSeconds;

  if (ageSeconds < -30 || ageSeconds > maxAgeSeconds) {
    throw new TelegramAuthError("Telegram initData has expired.");
  }

  const userValue = params.get("user");

  if (!userValue) {
    throw new TelegramAuthError("Telegram user data is missing.");
  }

  let user: TelegramWebAppUser;

  try {
    user = JSON.parse(userValue) as TelegramWebAppUser;
  } catch {
    throw new TelegramAuthError("Telegram user data is malformed.");
  }

  if (!Number.isSafeInteger(user.id) || user.id <= 0 || !user.first_name) {
    throw new TelegramAuthError("Telegram user data is invalid.");
  }

  return {
    user,
    authDate: new Date(authDateSeconds * 1000),
    queryId: params.get("query_id") ?? undefined,
  };
}
