"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Неправильний пароль");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Не вдалося підключитися до сервера");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top, #14251a 0%, #070907 48%, #020302 100%)",
        color: "#ffffff",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          borderRadius: "24px",
          border: "1px solid rgba(126, 255, 153, 0.18)",
          background: "rgba(10, 16, 11, 0.94)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              color: "#70f58b",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Slot Club
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              lineHeight: 1.1,
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#8d9a90",
              lineHeight: 1.6,
            }}
          >
            Введи пароль адміністратора, щоб відкрити панель керування.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#c7d2c9",
            }}
          >
            Пароль
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              height: "50px",
              padding: "0 14px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              outline: "none",
              background: "#0f1510",
              color: "#ffffff",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          {error ? (
            <p
              style={{
                margin: "12px 0 0",
                color: "#ff7a7a",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "50px",
              marginTop: "18px",
              border: 0,
              borderRadius: "14px",
              background: isLoading ? "#31583a" : "#70f58b",
              color: "#071008",
              fontSize: "15px",
              fontWeight: 800,
              cursor: isLoading ? "wait" : "pointer",
            }}
          >
            {isLoading ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </section>
    </main>
  );
}