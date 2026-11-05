import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "dotenv";

const root = process.cwd();
const output = resolve(dirname(root), "EmpresTI-entrega-2026-11-05.zip");
const paths = [...new Set(execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean))]
  .filter((file) => existsSync(join(root, file)));
const privateFile = join(root, ".env.remote-dev");
const knownSecrets = [];
if (existsSync(privateFile)) {
  const config = parse(readFileSync(privateFile));
  if (config.DIRECT_URL) {
    const uri = new URL(config.DIRECT_URL);
    knownSecrets.push(config.DIRECT_URL, uri.password, decodeURIComponent(uri.password));
  }
}
for (const file of paths) {
  if ((/(^|\/)\.env/.test(file) && file !== ".env.example") || /(^|\/)(node_modules|\.git|\.next|generated)(\/|$)/.test(file)) {
    throw new Error("Arquivo privado ou gerado na seleção: " + file);
  }
  const text = readFileSync(join(root, file)).toString("utf8");
  if (knownSecrets.filter((value) => value.length >= 8).some((value) => text.includes(value))) {
    throw new Error("Credencial encontrada em " + file);
  }
}
const manifest = {
  generatedAt: new Date().toISOString(),
  commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  files: paths.map((file) => ({ path: file, sha256: createHash("sha256").update(readFileSync(join(root, file))).digest("hex") })),
  excluded: [".env reais", ".git", "node_modules", ".next", "cliente Prisma gerado"],
};
const scratch = mkdtempSync(join(tmpdir(), "empresti-delivery-"));
const selection = join(scratch, "selection.json");
writeFileSync(selection, JSON.stringify({ root, output, manifest, paths,
  log: execFileSync("git", ["log", "--oneline", "--decorate", "--all"], { encoding: "utf8" }) }));
const python = process.env.PYTHON || "python";
const script = `import json,zipfile,pathlib,hashlib,sys
d=json.load(open(sys.argv[1],encoding='utf-8'))
with zipfile.ZipFile(d['output'],'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in d['paths']: z.write(pathlib.Path(d['root'])/p,'EmpresTI/'+p)
 z.writestr('EmpresTI/ENTREGA-MANIFESTO.json',json.dumps(d['manifest'],ensure_ascii=False,indent=2))
 z.writestr('EmpresTI/docs/evidencias/git-log-entrega.txt',d['log'])
with zipfile.ZipFile(d['output']) as z:
 assert z.testzip() is None
 for f in d['manifest']['files']:
  assert hashlib.sha256(z.read('EmpresTI/'+f['path'])).hexdigest()==f['sha256']
print('ZIP verificado: '+d['output'])
print('Arquivos de fonte: '+str(len(d['paths'])))
print('SHA-256: '+hashlib.sha256(pathlib.Path(d['output']).read_bytes()).hexdigest())
`;
process.stdout.write(execFileSync(python, ["-c", script, selection], { encoding: "utf8" }));
