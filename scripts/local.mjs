import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2];
if (!["up", "down"].includes(mode)) throw new Error("Use npm run up ou npm run down.");
if (Number(process.versions.node.split(".")[0]) < 24) throw new Error("Instale Node.js 24 e Docker Desktop antes de iniciar.");

function node(file, args, env = process.env, capture = false) {
  const result = spawnSync(process.execPath, [file, ...args], {
    cwd: root, env, encoding: "utf8", stdio: capture ? "pipe" : "inherit", maxBuffer: 30 * 1024 * 1024,
  });
  if (result.status !== 0) {
    if (capture) console.error("Supabase local não iniciou. Verifique se o Docker Desktop está em execução e as portas locais estão livres.");
    throw new Error("Comando local falhou; nenhum destino remoto foi usado.");
  }
}

if (!existsSync(new URL("../node_modules/prisma", import.meta.url))) {
  if (!process.env.npm_execpath) throw new Error("Inicie com npm run up para instalar pelo lockfile.");
  node(process.env.npm_execpath, ["ci"]);
}
const supabase = "node_modules/supabase/dist/supabase.js";
if (mode === "down") {
  node(supabase, ["stop"], process.env, true);
  console.log("Serviços Supabase locais parados; os dados foram preservados.");
} else {
  const envPath = new URL("../.env", import.meta.url);
  if (!existsSync(envPath)) {
    writeFileSync(envPath, "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=dev\nDIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=dev\nNEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n");
  }
  const { parse } = await import("dotenv");
  const fileConfig = parse(readFileSync(envPath));
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    const uri = new URL(fileConfig[key] || "invalid:");
    if (uri.hostname !== "127.0.0.1" || uri.port !== "54322" || uri.searchParams.get("schema") !== "dev") {
      throw new Error("Subida bloqueada: .env deve apontar exclusivamente para PostgreSQL local na porta 54322 e schema dev.");
    }
  }
  const env = { ...process.env, ...fileConfig, DOTENV_CONFIG_PATH: fileURLToPath(envPath) };
  console.log("Iniciando Supabase local (PostgreSQL, Auth e gateway)…");
  node(supabase, ["start", "-x", "realtime,storage-api,imgproxy,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor"], env, true);
  node("node_modules/prisma/build/index.js", ["generate"], env);
  node("node_modules/prisma/build/index.js", ["migrate", "deploy"], env);
  if (process.argv.includes("--services-only")) {
    console.log("Serviços e migrations locais prontos; aplicação existente preservada.");
    process.exit(0);
  }
  console.log("Abra http://localhost:3000/andar-zero. Ctrl+C encerra a aplicação; npm run down para os serviços.");
  const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], { cwd: root, env, stdio: "inherit" });
  process.on("SIGINT", () => app.kill("SIGINT"));
  app.on("exit", (code) => { process.exitCode = code || 0; });
}
