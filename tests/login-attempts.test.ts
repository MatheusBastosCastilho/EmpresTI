// @vitest-environment node
import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";

import { finishLoginAttempt, reserveLoginAttempt } from "@/src/server/auth/login-attempts";
import { hasActivePasswordSession } from "@/src/server/auth/session";
import { disconnectDatabase, getDatabase } from "@/src/server/db";

if (!process.env.TEST_DATABASE_URL || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
  throw new Error("Execute npm test: integração exige banco descartável criado pelo runner.");
}

afterAll(async () => {
  vi.unstubAllEnvs();
  await disconnectDatabase();
});

describe("Login", () => {
  it("LOGIN-07 preserva o horário da autenticação ao renovar o token", () => {
    const password = { method: "password", timestamp: 100 };
    const refresh = { method: "token_refresh", timestamp: 28_850 };
    expect(hasActivePasswordSession([password, refresh], 28_899)).toBe(true);
    expect(hasActivePasswordSession([password, refresh], 28_900)).toBe(false);
    expect(hasActivePasswordSession([refresh], 28_900)).toBe(false);
  });

  it("LOGIN-08 limita concorrência por conta, aplica teto por IP e permite nova tentativa após expirar", async () => {
    vi.stubEnv("LOGIN_RATE_LIMIT_KEY", randomBytes(32).toString("hex"));
    const seed = randomUUID();
    const account = `${seed}@example.test`;
    const ip = `ip-${seed}`;

    const reservations = await Promise.all(Array.from({ length: 6 }, () => reserveLoginAttempt(account, ip)));
    const allowed = reservations.filter((id) => id !== null);
    expect(allowed).toHaveLength(5);
    await finishLoginAttempt(allowed[0], true);
    expect(await reserveLoginAttempt(account, ip)).not.toBeNull();

    for (let i = 0; i < 15; i++) {
      expect(await reserveLoginAttempt(`${i}-${account}`, ip)).not.toBeNull();
    }
    expect(await reserveLoginAttempt(`other-${account}`, ip)).toBeNull();
    await getDatabase().loginAttempt.updateMany({
      where: { id: { in: allowed.slice(1) } },
      data: { attemptedAt: new Date(Date.now() - 16 * 60 * 1000) },
    });
    expect(await reserveLoginAttempt(account, ip)).not.toBeNull();
  });
});
