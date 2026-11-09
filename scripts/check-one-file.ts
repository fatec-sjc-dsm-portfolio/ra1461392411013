import { copyFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { parseHTML } from "linkedom";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const fixturePath = join(rootDir, "tests/fixtures/api-extra.yaml");
const destPath = join(rootDir, "src/content/projects/api/fixture-extra.yaml");
const outDir = ".tmp/one-file";
const outDirAbs = join(rootDir, outDir);

function countCards(htmlPath: string): number {
  const html = readFileSync(htmlPath, "utf-8");
  const { document } = parseHTML(html);
  return document.querySelectorAll('#panel-academic [id^="project-"]').length;
}

try {
  copyFileSync(fixturePath, destPath);

  execFileSync("npx", ["astro", "build"], {
    cwd: rootDir,
    env: { ...process.env, OUT_DIR: outDir },
    stdio: "inherit",
  });

  const ptFile = join(outDirAbs, "pt/index.html");
  const enFile = join(outDirAbs, "en/index.html");

  if (!existsSync(ptFile) || !existsSync(enFile)) {
    throw new Error("build did not produce pt/index.html and en/index.html");
  }

  const ptCount = countCards(ptFile);
  const enCount = countCards(enFile);

  if (ptCount !== 7) {
    throw new Error(`esperado 7 cartões em /pt/, encontrado ${ptCount}`);
  }
  if (enCount !== 7) {
    throw new Error(`esperado 7 cartões em /en/, encontrado ${enCount}`);
  }

  console.log("check:one-file: um YAML novo virou cartão nos dois idiomas.");
} finally {
  if (existsSync(destPath)) rmSync(destPath);
  if (existsSync(outDirAbs)) rmSync(outDirAbs, { recursive: true, force: true });
}
