import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE =
  "slot_club_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  exp: number;
  role: "admin";
};

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must contain at least 32 characters.",
    );
  }

  return secret;
}

function sign(value: string): string {
  return createHmac(
    "sha256",
    getSessionSecret(),
  )
    .update(value)
    .digest("base64url");
}

export function createAdminSessionToken(): string {
  const payload: SessionPayload = {
    exp:
      Math.floor(Date.now() / 1000) +
      SESSION_TTL_SECONDS,
    role: "admin",
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
  ).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
): boolean {
  if (!token) {
    return false;
  }

  const separatorIndex = token.indexOf(".");

  if (
    separatorIndex <= 0 ||
    separatorIndex === token.length - 1
  ) {
    return false;
  }

  const encodedPayload = token.slice(
    0,
    separatorIndex,
  );

  const suppliedSignature = token.slice(
    separatorIndex + 1,
  );

  const expectedSignature =
    sign(encodedPayload);

  const suppliedBuffer = Buffer.from(
    suppliedSignature,
    "utf8",
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8",
  );

  if (
    suppliedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  if (
    !timingSafeEqual(
      suppliedBuffer,
      expectedBuffer,
    )
  ) {
    return false;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(
        encodedPayload,
        "base64url",
      ).toString("utf8"),
    ) as unknown;

    if (
      typeof decodedPayload !== "object" ||
      decodedPayload === null
    ) {
      return false;
    }

    const payload =
      decodedPayload as Partial<SessionPayload>;

    return (
      payload.role === "admin" &&
      typeof payload.exp === "number" &&
      Number.isSafeInteger(payload.exp) &&
      payload.exp >
        Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function verifyAdminPassword(
  password: string,
): boolean {
  const configuredPassword =
    process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    throw new Error(
      "ADMIN_PASSWORD is not configured.",
    );
  }

  const supplied = Buffer.from(
    password,
    "utf8",
  );

  const expected = Buffer.from(
    configuredPassword,
    "utf8",
  );

  if (
    supplied.length !== expected.length
  ) {
    return false;
  }

  return timingSafeEqual(
    supplied,
    expected,
  );
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite: "strict" as const,

  /*
   * Cookie must also be available to
   * /api/admin/* routes.
   *
   * With path "/admin", the browser does not
   * send it to /api/admin/shop,
   * /api/admin/economy, etc.
   */
  path: "/",

  maxAge: SESSION_TTL_SECONDS,
};