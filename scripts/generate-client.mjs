import { spawnSync } from "node:child_process";

// Generation does not contact a database. This URL only satisfies the CLI config
// when building a clean checkout without private environment files.
const env = { ...process.env, DIRECT_URL: process.env.DIRECT_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=dev" };
const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "generate"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);
