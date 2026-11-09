import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";

import { getDatabase } from "../db";

export function readClientIp(request: Request) {
  if (process.env.VERCEL !== "1") return "local";
  const ip = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (!ip || !isIP(ip)) throw new Error("IP da requisição indisponível.");
  return ip;
}

export async function reserveLoginAttempt(email: string, ip: string) {
  const key = process.env.LOGIN_RATE_LIMIT_KEY;
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) throw new Error("Controle de tentativas não configurado.");
  const accountKey = createHmac("sha256", key).update(`account:${email}`).digest();
  const ipKey = createHmac("sha256", key).update(`ip:${ip}`).digest();
  const db = getDatabase();

  return db.$transaction(async (tx) => {
    // Both dimensions must be locked before checking the shared window.
    const lockKeys = [accountKey.readBigInt64BE(), ipKey.readBigInt64BE()];
    lockKeys.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    for (const lockKey of lockKeys) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;
    }
    const [clock] = await tx.$queryRaw<{ time: Date }[]>`SELECT clock_timestamp() AS time`;
    const cutoff = new Date(clock.time.getTime() - 15 * 60 * 1000);
    const active = { attemptedAt: { gt: cutoff } };
    const byAccount = await tx.loginAttempt.count({ where: { ...active, accountKey } });
    const byIp = await tx.loginAttempt.count({ where: { ...active, ipKey } });
    if (byAccount >= 5 || byIp >= 20) return null;

    const id = randomUUID();
    await tx.loginAttempt.create({ data: { id, accountKey, ipKey, attemptedAt: clock.time } });
    return id;
  }, { isolationLevel: "ReadCommitted" });
}

export async function finishLoginAttempt(id: string, success: boolean) {
  const db = getDatabase();
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  await db.loginAttempt.deleteMany({
    where: success ? { OR: [{ id }, { attemptedAt: { lte: cutoff } }] } : { attemptedAt: { lte: cutoff } },
  });
}
