import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, "dist");

const problems: string[] = [];

function walk(dir: string, predicate: (file: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, predicate));
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

// Regra 1: foto pessoal.
const photoFiles = walk(join(rootDir, "src/assets/profile"), (f) =>
  /photo\.(jpe?g|png|webp|avif)$/i.test(f),
);
if (photoFiles.length === 0) {
  problems.push("Foto pessoal ausente (regra 1)");
}

// Currículo em PDF.
const resumePath = join(rootDir, "public/files/kauan-fonseca-resume-en.pdf");
if (!existsSync(resumePath) || statSync(resumePath).size === 0) {
  problems.push("Currículo em PDF ausente (public/files/kauan-fonseca-resume-en.pdf)");
}

// 6 cartões de API nos dois idiomas (regra 2).
for (const locale of ["pt", "en"]) {
  const file = join(distDir, locale, "index.html");
  if (!existsSync(file)) {
    problems.push(`${locale}/index.html não encontrado; rode npm run build antes`);
    continue;
  }
  const html = readFileSync(file, "utf-8");
  const { document } = parseHTML(html);
  const cards = document.querySelectorAll('#panel-academic [id^="project-"]');
  if (cards.length !== 6) {
    problems.push(`${locale}/index.html tem ${cards.length} cartões de API, esperado 6`);
  }
}

// Nenhum depoimento de exemplo publicado.
const testimonialFiles = walk(join(rootDir, "src/content/testimonials"), (f) =>
  f.endsWith(".yaml"),
);
const placeholders = testimonialFiles.filter((f) =>
  /^placeholder:\s*true\s*$/m.test(readFileSync(f, "utf-8")),
);
if (placeholders.length > 0) {
  const names = placeholders.map((f) => f.split("/").pop()).join(", ");
  problems.push(
    `${placeholders.length} depoimento(s) de exemplo ainda publicados (${names}). ` +
      "Troque pelo texto real ou apague os arquivos.",
  );
}

// Nenhum "TODO" ou "PENDENTE" no dist/.
const htmlFiles = walk(distDir, (f) => f.endsWith(".html"));
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf-8");
  if (/TODO|PENDENTE/i.test(html)) {
    problems.push(`${file.replace(`${distDir}/`, "")} contém "TODO" ou "PENDENTE"`);
  }
}

if (problems.length > 0) {
  console.error("\ncheck:delivery: não pronto para entregar\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log("check:delivery: pronto para entregar.");
}
