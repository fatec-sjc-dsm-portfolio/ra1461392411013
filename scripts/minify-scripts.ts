import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

// Os scripts de public/scripts/ são copiados crus para dist/. Comentários e
// nomes longos ajudam quem lê a fonte, mas contam no orçamento de 2 KB de JS
// por página (RNF-06). Então minificamos a cópia do dist/, nunca a fonte.
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = process.env.OUT_DIR ?? "dist";
const scriptsDir = join(rootDir, outDir, "scripts");

let files: string[];
try {
  files = readdirSync(scriptsDir).filter((f) => f.endsWith(".js"));
} catch {
  console.error(`minify-scripts: ${scriptsDir} não encontrado; rode o build antes.`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const file of files) {
  const path = join(scriptsDir, file);
  const source = readFileSync(path, "utf-8");
  const result = transformSync(source, {
    minify: true,
    // Scripts clássicos, nunca módulos: precisam rodar em <script src>.
    format: "iife",
    target: "es2020",
  });

  before += statSync(path).size;
  writeFileSync(path, result.code);
  after += statSync(path).size;
}

console.log(
  `minify-scripts: ${files.length} arquivo(s), ${before} B -> ${after} B ` +
    `(-${Math.round((1 - after / before) * 100)}%)`,
);
