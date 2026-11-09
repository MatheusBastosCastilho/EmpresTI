import { PostgreSqlContainer } from "@testcontainers/postgresql";
import pg from "pg";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = fileURLToPath(new URL("../", import.meta.url));
let container;
let client;
function run(file, args, env) {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: root, env, stdio: "inherit" });
  if (result.status !== 0) throw new Error("Uma verificação do banco de teste falhou.");
}

try {
  console.log("Criando PostgreSQL descartável; nenhum banco dev ou remoto será usado.");
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("empresti_test")
    .withUsername("postgres")
    .withPassword(randomBytes(24).toString("hex"))
    .start();
  const uri = new URL(container.getConnectionUri());
  uri.searchParams.set("schema", "dev");
  const connection = uri.toString();
  client = new pg.Client({ connectionString: connection });
  await client.connect();
  // Only the external Auth SQL contract is needed; authentication is not under test.
  await client.query(`
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id UUID PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE
      AS 'SELECT NULLIF(current_setting(''request.jwt.claim.sub'', true), '''')::UUID';
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN;
  `);
  const env = { ...process.env, DIRECT_URL: connection, DATABASE_URL: connection, TEST_DATABASE_URL: connection };
  run("node_modules/prisma/build/index.js", ["generate"], env);
  run("node_modules/prisma/build/index.js", ["migrate", "deploy"], env);
  await client.query(readFileSync(new URL("../prisma/tests/dev-smoke.sql", import.meta.url), "utf8"));
  console.log("Smoke de constraints/RLS passou no banco novo.");
  // Keep Node and jsdom in separate Vitest processes so a reused worker never changes environments.
  run("node_modules/vitest/vitest.mjs", ["run", "tests/"], env);
  run("node_modules/vitest/vitest.mjs", ["run", "components/"], env);
  console.log("AZ-03/AZ-06: migrations e testes passaram em PostgreSQL novo e isolado.");
} catch (error) {
  console.error("Falha na suíte isolada:", error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[conexão omitida]") : "erro desconhecido");
  process.exitCode = 1;
} finally {
  if (client) await client.end().catch(() => {});
  if (container) await container.stop();
}
