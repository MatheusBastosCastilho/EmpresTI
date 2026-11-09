import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function git(...args) {
  const result = spawnSync("git", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error("Falha ao ler a revisão Git.");
  return result.stdout;
}

function verify(specPath, baseRef, snapshot) {
  if (!/^docs\/specs\/\d{3}-[a-z0-9-]+\/spec\.md$/.test(specPath ?? "")) {
    throw new Error("Uso: node scripts/verify-spec.mjs docs/specs/NNN-nome/spec.md [base]");
  }

  const head = git("rev-parse", "HEAD").trim();
  if (snapshot && !/^--tree=[0-9a-f]{40}$/.test(snapshot)) {
    throw new Error("Informe um snapshot imutável com --tree=<hash>.");
  }
  const revision = snapshot ? git("rev-parse", "--verify", `${snapshot.slice(7)}^{tree}`).trim() : head;
  const baseCommit = git("rev-parse", "--verify", "--end-of-options",
    `${baseRef ?? "origin/main"}^{commit}`).trim();
  const base = git("merge-base", head, baseCommit).trim();
  const spec = git("show", `${revision}:${specPath}`);
  const ids = [...new Set(spec.match(/\b(?:CA|LOGIN)-\d+\b/g))].sort();
  if (!ids.length) throw new Error("A spec precisa identificar os critérios de aceite.");
  const diff = git("diff", "--no-ext-diff", "--no-textconv", base, revision, "--",
    "app", "components", "src", "lib", "prisma", "tests", "scripts", "supabase", "data",
    "package.json", "next.config.ts", "proxy.ts", "docs/evidencias/pratica-local.md");
  if (!diff.trim()) throw new Error("A revisão não tem alterações de implementação em relação à base.");
  if (diff.length > 150_000) throw new Error("Diff grande demais. Escolha uma base mais próxima.");

  const role = readFileSync(".codex/agents/spec_verifier.toml", "utf8")
    .match(/developer_instructions = """\r?\n([\s\S]+?)"""/)?.[1];
  if (!role) throw new Error("Perfil do verificador inválido.");

  const directory = mkdtempSync(join(realpathSync(tmpdir()), "empresti-spec-"));
  try {
    const schemaPath = join(directory, "schema.json");
    writeFileSync(schemaPath, JSON.stringify({
      type: "object",
      additionalProperties: false,
      required: ["criterios"],
      properties: {
        criterios: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "status", "evidencia"],
            properties: {
              id: { type: "string", enum: ids },
              status: { type: "string", enum: ["aprovado", "reprovado", "sem_evidencia"] },
              evidencia: { type: "string" },
            },
          },
        },
      },
    }));

    const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
      /^(PATH|PATHEXT|SystemRoot|WINDIR|ComSpec|USERPROFILE|HOME|APPDATA|LOCALAPPDATA|TEMP|TMP)$/i.test(key)));
    const result = spawnSync("codex", [
      "exec", "--ephemeral", "--ignore-user-config", "--skip-git-repo-check",
      "--sandbox", "read-only", "--output-schema", schemaPath, "--cd", directory,
      "-c", "approval_policy='never'", "-c", "features.shell_tool=false",
      "-c", "features.apps=false", "-c", "features.plugins=false",
      "-c", "features.memories=false", "-c", "features.request_permissions_tool=false",
      "-c", "web_search='disabled'", "-c", "mcp_servers={}", "-",
    ], {
      cwd: directory,
      env: environment,
      input: `${role}\nCritérios esperados: ${ids.join(", ")}\n\nSPEC ${specPath}\n${spec}\n\nDIFF ${base}..${revision}\n${diff}`,
      encoding: "utf8",
      timeout: 240_000,
    });
    if (result.error || result.status !== 0) {
      throw new Error(`Codex não produziu parecer (saída ${result.status ?? result.error?.code}).`);
    }
    const { criterios } = JSON.parse(result.stdout);
    if (!Array.isArray(criterios) || criterios.length !== ids.length ||
      ids.some((id) => criterios.filter((item) => item.id === id && item.evidencia?.trim()).length !== 1)) {
      throw new Error("Parecer incompleto ou com critérios duplicados.");
    }
    if (!snapshot && git("rev-parse", "HEAD").trim() !== revision) {
      throw new Error("A revisão mudou durante a verificação.");
    }

    criterios.sort((first, second) => first.id.localeCompare(second.id));
    console.log(JSON.stringify({ spec: specPath, base, revision, tipo: snapshot ? "snapshot" : "commit", criterios }, null, 2));
    return criterios.every((item) => item.status === "aprovado");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

try {
  process.exitCode = verify(process.argv[2], process.argv[3], process.argv[4]) ? 0 : 1;
} catch (error) {
  console.error(`Verificação bloqueada: ${error.message}`);
  process.exitCode = 1;
}
