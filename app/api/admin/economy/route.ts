import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/adminSession";
import {
  getEconomySettings,
  serializeEconomySettings,
} from "@/lib/economySettings";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(
    ADMIN_SESSION_COOKIE,
  )?.value;

  if (
    !token ||
    !verifyAdminSessionToken(token)
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const settings = await getEconomySettings();

  return NextResponse.json(
    serializeEconomySettings(settings),
  );
}