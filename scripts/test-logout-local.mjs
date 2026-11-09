import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const status = JSON.parse(execFileSync(process.execPath,
  ["node_modules/supabase/dist/supabase.js", "status", "-o", "json"],
  { stdio: ["ignore", "pipe", "ignore"] }));
const dbUrl = new URL(status.DB_URL);
if (status.API_URL !== "http://127.0.0.1:54321" ||
  !["localhost", "127.0.0.1"].includes(dbUrl.hostname) || dbUrl.port !== "54322") {
  throw new Error("Este teste exige o Supabase local.");
}
dbUrl.searchParams.set("schema", "dev");
const db = new pg.Client({ connectionString: dbUrl.href });
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = `${randomUUID()}@example.test`;
const password = randomBytes(24).toString("hex");
const rateKey = randomBytes(32).toString("hex");
const origin = "http://127.0.0.1:3186";
let userId;
let createdTenant;
let app;

try {
  await db.connect();
  const registered = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ok(registered.data.user, "Não foi possível criar a conta descartável.");
  userId = registered.data.user.id;
  const env = {
    ...process.env,
    DATABASE_URL: dbUrl.href,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
    LOGIN_RATE_LIMIT_KEY: rateKey,
  };
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3186"],
    { env, stdio: "ignore" });
  let online = false;
  for (let i = 0; i < 45 && app.exitCode === null; i++) {
    try { online = (await fetch(`${origin}/login`)).ok; } catch {}
    if (online) break;
    await wait(1000);
  }
  assert.ok(online, "A aplicação de teste não iniciou.");
  const post = (path, body, cookie) => fetch(`${origin}/api/trpc/${path}`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
  const credentials = { json: { email, password } };
  const denied = await post("login", credentials);
  assert.equal(denied.status, 401);
  assert.equal((await denied.json()).error.json.data.code, "UNAUTHORIZED");
  assert.equal(denied.headers.getSetCookie().length, 0);

  createdTenant = (await db.query("INSERT INTO dev.tenants (slug, name) VALUES ('suporte_ti', 'Suporte TI') ON CONFLICT (slug) DO NOTHING RETURNING id")).rows[0]?.id;
  await db.query("INSERT INTO dev.memberships (tenant_id, user_id, display_name) SELECT id, $1, 'Teste descartável' FROM dev.tenants WHERE slug='suporte_ti'", [userId]);
  const login = await post("login", credentials);
  assert.equal(login.status, 200);
  const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  assert.ok(cookie);
  const replay = () => fetch(`${origin}/api/trpc/session`, { headers: { cookie } });
  assert.equal((await replay()).status, 200);
  const logout = await post("logout", {}, cookie);
  assert.equal(logout.status, 200);
  const revoked = await replay();
  assert.equal(revoked.status, 401);
  assert.equal((await revoked.json()).error.json.data.code, "UNAUTHORIZED");
  console.log("LOGIN-04 e LOGIN-06: vínculo ausente e replay pós-logout rejeitados.");
} finally {
  if (app?.pid) {
    if (process.platform === "win32") {
      try { execFileSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
    } else {
      app.kill();
    }
  }
  if (userId) {
    const accountKey = createHmac("sha256", rateKey).update(`account:${email}`).digest();
    await db.query("DELETE FROM dev.login_attempts WHERE account_key=$1", [accountKey]);
    await db.query("DELETE FROM dev.memberships WHERE user_id=$1", [userId]);
    await admin.auth.admin.deleteUser(userId);
  }
  if (createdTenant) await db.query("DELETE FROM dev.tenants WHERE id=$1", [createdTenant]);
  await db.end();
}
