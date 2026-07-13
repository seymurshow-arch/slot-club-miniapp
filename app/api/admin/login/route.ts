import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/adminSession";

type LoginBody = {
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const password = body.password;

    if (typeof password !== "string" || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Неправильний пароль" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(),
      adminSessionCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 },
    );
  }
}