import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parse } from "dotenv";

const root = fileURLToPath(new URL("../", import.meta.url));
const privateFile = new URL("../.env.remote-dev", import.meta.url);
const fileConfig = existsSync(privateFile) ? parse(readFileSync(privateFile)) : {};
const directUrl = process.env.DIRECT_URL || fileConfig.DIRECT_URL;

function reject() {
  console.error("Deploy bloqueado: informe a conexão TLS do projeto autorizado, porta 5432 e schema dev.");
  process.exit(1);
}

if (!directUrl || directUrl.includes("[YOUR-PASSWORD]")) reject();

let uri;
try {
  uri = new URL(directUrl);
  decodeURIComponent(uri.password);
} catch {
  reject();
}

if (
  !["postgres:", "postgresql:"].includes(uri.protocol) ||
  uri.hostname !== "aws-0-us-west-2.pooler.supabase.com" ||
  uri.port !== "5432" ||
  uri.pathname !== "/postgres" ||
  uri.username !== "postgres.puwkfemwkgsmmfjdqdgq" ||
  !uri.password ||
  uri.hash ||
  uri.searchParams.getAll("schema").length !== 1 ||
  uri.searchParams.get("schema") !== "dev" ||
  uri.searchParams.getAll("sslmode").length !== 1 ||
  uri.searchParams.get("sslmode") !== "require" ||
  [...uri.searchParams.keys()].some((key) => !["schema", "sslmode"].includes(key))
) reject();

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) reject();
if (args[0] === "--check") {
  console.log("Destino dev validado; nenhuma conexão ou migration executada.");
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [fileURLToPath(new URL("../node_modules/prisma/build/index.js", import.meta.url)), "migrate", "deploy"],
  {
    cwd: root,
    env: { ...process.env, DIRECT_URL: directUrl, DOTENV_CONFIG_PATH: fileURLToPath(privateFile) },
    encoding: "utf8",
  },
);

for (const output of [result.stdout || "", result.stderr || ""]) {
  const redacted = output
    .replaceAll(directUrl, "[connection redacted]")
    .replaceAll(uri.password, "[password redacted]")
    .replaceAll(decodeURIComponent(uri.password), "[password redacted]")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[connection redacted]");
  if (redacted) process.stdout.write(redacted);
}

if (result.error) console.error("Não foi possível iniciar o Prisma Migrate.");
process.exit(result.status ?? 1);
