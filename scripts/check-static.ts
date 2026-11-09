import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
import astroConfig from "../astro.config.mjs";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

type CheckName = "external" | "csp" | "i18n" | "links" | "budgets";
const ALL_CHECKS: CheckName[] = ["external", "csp", "i18n", "links", "budgets"];

function parseArgs() {
  const args = process.argv.slice(2);
  let dist = "dist";
  let only: CheckName[] = ALL_CHECKS;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dist") {
      dist = args[i + 1] ?? dist;
      i++;
    } else if (args[i] === "--only") {
      only = (args[i + 1] ?? "").split(",").filter(Boolean) as CheckName[];
      i++;
    }
  }

  return { dist: resolve(rootDir, dist), only };
}

function walk(dir: string, predicate: (file: string) => boolean): string[] {
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

interface Failure {
  check: CheckName;
  file: string;
  message: string;
}

const failures: Failure[] = [];

function fail(check: CheckName, file: string, message: string) {
  failures.push({ check, file, message });
}

// A base vem da própria config do Astro, que já resolve process.env.BASE.
// Assim o check e o build nunca divergem sobre o sub-path do Pages.
const BASE = astroConfig.base ?? "/";

function rel(file: string, distDir: string) {
  return relative(distDir, file);
}

// ---------- external ----------

const RESOURCE_SELECTORS: Array<{ selector: string; attr: string }> = [
  { selector: "img", attr: "src" },
  { selector: "img", attr: "srcset" },
  { selector: "source", attr: "src" },
  { selector: "source", attr: "srcset" },
  { selector: "video", attr: "src" },
  { selector: "video", attr: "poster" },
  { selector: "audio", attr: "src" },
  { selector: 'link[rel="stylesheet"]', attr: "href" },
  { selector: 'link[rel="preload"]', attr: "href" },
  { selector: 'link[rel="icon"]', attr: "href" },
  { selector: 'link[rel="apple-touch-icon"]', attr: "href" },
  { selector: 'link[rel="manifest"]', attr: "href" },
  { selector: "script[src]", attr: "src" },
];

const ABSOLUTE_URL = /^(https?:)?\/\//i;

function checkExternal(htmlFiles: string[], distDir: string) {
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf-8");
    const { document } = parseHTML(html);

    for (const { selector, attr } of RESOURCE_SELECTORS) {
      for (const el of document.querySelectorAll(selector)) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        for (const candidate of value.split(",")) {
          const url = candidate.trim().split(/\s+/)[0] ?? "";
          if (ABSOLUTE_URL.test(url)) {
            fail(
              "external",
              rel(file, distDir),
              `${selector}[${attr}] carrega URL absoluta: ${url}`,
            );
          }
        }
      }
    }
  }

  const cssFiles = walk(distDir, (f) => f.endsWith(".css"));
  for (const file of cssFiles) {
    const css = readFileSync(file, "utf-8");
    const urlMatches = css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g);
    for (const match of urlMatches) {
      if (ABSOLUTE_URL.test(match[1] ?? "")) {
        fail("external", rel(file, distDir), `CSS url() absoluta: ${match[1]}`);
      }
    }
    const importMatches = css.matchAll(/@import\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      if (ABSOLUTE_URL.test(match[1] ?? "")) {
        fail("external", rel(file, distDir), `CSS @import absoluto: ${match[1]}`);
      }
    }
  }

  const jsFiles = walk(distDir, (f) => f.endsWith(".js"));
  for (const file of jsFiles) {
    const js = readFileSync(file, "utf-8");
    const fetchMatches = js.matchAll(/\bfetch\(\s*['"]([^'"]+)['"]/g);
    for (const match of fetchMatches) {
      if (ABSOLUTE_URL.test(match[1] ?? "")) {
        fail("external", rel(file, distDir), `fetch() absoluto: ${match[1]}`);
      }
    }
    const importMatches = js.matchAll(/\bimport\(\s*['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      if (ABSOLUTE_URL.test(match[1] ?? "")) {
        fail("external", rel(file, distDir), `import() absoluto: ${match[1]}`);
      }
    }
  }
}

// ---------- csp ----------

const FORBIDDEN_CSP_TOKENS = ["unsafe-inline", "unsafe-eval", "*", "data:", "http:", "https:"];
const REQUIRED_CSP_SUBSTRINGS = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
];

function checkCsp(htmlFiles: string[], distDir: string) {
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf-8");
    const { document } = parseHTML(html);
    const metas = [...document.querySelectorAll('meta[http-equiv]')].filter(
      (el) => el.getAttribute("http-equiv")?.toLowerCase() === "content-security-policy",
    );

    if (metas.length === 0) {
      fail("csp", rel(file, distDir), "nenhuma meta CSP encontrada");
      continue;
    }
    if (metas.length > 1) {
      fail("csp", rel(file, distDir), `${metas.length} metas CSP encontradas, esperado 1`);
    }

    const head = document.querySelector("head");
    const firstElement = head?.firstElementChild;
    if (firstElement !== metas[0]) {
      fail("csp", rel(file, distDir), "a meta CSP não é o primeiro filho de <head>");
    }

    const content = metas[0]?.getAttribute("content") ?? "";
    for (const token of FORBIDDEN_CSP_TOKENS) {
      if (content.includes(token)) {
        fail("csp", rel(file, distDir), `CSP contém token proibido: ${token}`);
      }
    }
    for (const required of REQUIRED_CSP_SUBSTRINGS) {
      if (!content.includes(required)) {
        fail("csp", rel(file, distDir), `CSP não contém a diretiva: ${required}`);
      }
    }

    // Nothing may precede the meta: no earlier link/script/style siblings.
    let sibling = metas[0]?.previousElementSibling;
    while (sibling) {
      fail("csp", rel(file, distDir), `elemento antes da meta CSP: <${sibling.tagName}>`);
      sibling = sibling.previousElementSibling;
    }
  }
}

// ---------- i18n ----------

function checkI18n(distDir: string) {
  const ptDir = join(distDir, "pt");
  const enDir = join(distDir, "en");

  let ptRoutes: string[] = [];
  let enRoutes: string[] = [];
  try {
    ptRoutes = walk(ptDir, (f) => f.endsWith(".html")).map((f) => relative(ptDir, f));
  } catch {
    fail("i18n", "pt/", "pasta pt/ não encontrada");
  }
  try {
    enRoutes = walk(enDir, (f) => f.endsWith(".html")).map((f) => relative(enDir, f));
  } catch {
    fail("i18n", "en/", "pasta en/ não encontrada");
  }

  const ptSet = new Set(ptRoutes);
  const enSet = new Set(enRoutes);
  for (const route of ptSet) {
    if (!enSet.has(route)) fail("i18n", `pt/${route}`, `sem equivalente em en/${route}`);
  }
  for (const route of enSet) {
    if (!ptSet.has(route)) fail("i18n", `en/${route}`, `sem equivalente em pt/${route}`);
  }

  const indexable = [
    join(distDir, "index.html"),
    join(ptDir, "index.html"),
    join(enDir, "index.html"),
  ];

  for (const file of indexable) {
    let html: string;
    try {
      html = readFileSync(file, "utf-8");
    } catch {
      fail("i18n", relative(distDir, file), "arquivo não encontrado");
      continue;
    }
    const { document } = parseHTML(html);
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const alternates = [...document.querySelectorAll('link[rel="alternate"]')];
    const hreflangs = alternates.map((el) => el.getAttribute("hreflang"));

    if (!canonical) {
      fail("i18n", relative(distDir, file), "sem link canonical");
    }

    for (const required of ["pt-BR", "en-US", "x-default"]) {
      if (!hreflangs.includes(required)) {
        fail("i18n", relative(distDir, file), `sem hreflang="${required}"`);
      }
    }

    for (const alt of alternates) {
      const href = alt.getAttribute("href");
      if (!href) continue;
      const targetPath = new URL(href).pathname;
      const localPath = resolveToFile(distDir, targetPath);
      if (!fileExists(localPath)) {
        fail("i18n", relative(distDir, file), `hreflang aponta para arquivo inexistente: ${href}`);
      }
    }
  }
}

// ---------- links ----------

function resolveToFile(distDir: string, pathname: string): string {
  let p = pathname;
  if (BASE !== "/" && p.startsWith(BASE)) {
    p = p.slice(BASE.length - 1);
  }
  if (p.endsWith("/")) p += "index.html";
  return join(distDir, p.replace(/^\//, ""));
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function checkLinks(htmlFiles: string[], distDir: string) {
  const idCache = new Map<string, Set<string>>();

  function getIds(file: string): Set<string> {
    const cached = idCache.get(file);
    if (cached) return cached;
    let ids = new Set<string>();
    try {
      const html = readFileSync(file, "utf-8");
      const { document } = parseHTML(html);
      ids = new Set([...document.querySelectorAll("[id]")].map((el) => el.getAttribute("id") ?? ""));
    } catch {
      // file doesn't exist; handled elsewhere
    }
    idCache.set(file, ids);
    return ids;
  }

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf-8");
    const { document } = parseHTML(html);
    const baseDir = dirname(file);

    const linkEls = [
      ...document.querySelectorAll("a[href]"),
      ...document.querySelectorAll('link[rel="canonical"], link[rel="alternate"]'),
    ];

    for (const el of linkEls) {
      const href = el.getAttribute("href");
      if (!href) continue;
      if (ABSOLUTE_URL.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) continue;

      const [pathPart, hash] = href.split("#");
      let targetFile = baseDir;
      if (pathPart) {
        targetFile = pathPart.startsWith("/")
          ? resolveToFile(distDir, pathPart)
          : resolve(baseDir, pathPart.endsWith("/") ? `${pathPart}index.html` : pathPart);
      } else if (hash !== undefined) {
        targetFile = file;
      }

      if (!fileExists(targetFile)) {
        fail("links", rel(file, distDir), `link interno quebrado: ${href}`);
        continue;
      }

      if (hash) {
        const ids = getIds(targetFile);
        if (!ids.has(hash)) {
          fail("links", rel(file, distDir), `âncora inexistente: ${href}`);
        }
      }
    }

    for (const { selector, attr } of RESOURCE_SELECTORS) {
      for (const el of document.querySelectorAll(selector)) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        for (const candidate of value.split(",")) {
          const url = candidate.trim().split(/\s+/)[0] ?? "";
          if (!url || ABSOLUTE_URL.test(url) || url.startsWith("data:")) continue;
          const targetFile = url.startsWith("/") ? resolveToFile(distDir, url) : resolve(baseDir, url);
          if (!fileExists(targetFile)) {
            fail("links", rel(file, distDir), `recurso interno quebrado: ${url}`);
          }
        }
      }
    }
  }
}

// ---------- budgets ----------

const KB = 1024;

function checkBudgets(distDir: string) {
  for (const locale of ["pt", "en"]) {
    const file = join(distDir, locale, "index.html");
    if (!fileExists(file)) continue;

    const html = readFileSync(file, "utf-8");
    const { document } = parseHTML(html);

    const htmlSize = Buffer.byteLength(html, "utf-8");
    if (htmlSize > 80 * KB) {
      fail("budgets", `${locale}/index.html`, `HTML com ${(htmlSize / KB).toFixed(1)} KB, limite 80 KB`);
    }

    let jsBytes = 0;
    for (const el of document.querySelectorAll("script[src]")) {
      const src = el.getAttribute("src");
      if (!src || ABSOLUTE_URL.test(src)) continue;
      const target = resolveToFile(distDir, src);
      if (fileExists(target)) jsBytes += statSync(target).size;
    }
    if (jsBytes > 2 * KB) {
      fail("budgets", `${locale}/index.html`, `JS com ${(jsBytes / KB).toFixed(1)} KB, limite 2 KB`);
    }

    let cssBytes = 0;
    for (const el of document.querySelectorAll('link[rel="stylesheet"]')) {
      const href = el.getAttribute("href");
      if (!href || ABSOLUTE_URL.test(href)) continue;
      const target = resolveToFile(distDir, href);
      if (fileExists(target)) cssBytes += statSync(target).size;
    }
    if (cssBytes > 30 * KB) {
      fail("budgets", `${locale}/index.html`, `CSS com ${(cssBytes / KB).toFixed(1)} KB, limite 30 KB`);
    }
  }

  const fontsDir = join(rootDir, "src/assets/fonts");
  let fontFiles: string[] = [];
  try {
    fontFiles = walk(fontsDir, (f) => f.endsWith(".woff2"));
  } catch {
    fontFiles = [];
  }
  if (fontFiles.length > 4) {
    fail("budgets", "src/assets/fonts", `${fontFiles.length} arquivos de fonte, limite 4`);
  }
  const fontBytes = fontFiles.reduce((sum, f) => sum + statSync(f).size, 0);
  if (fontBytes > 160 * KB) {
    fail("budgets", "src/assets/fonts", `${(fontBytes / KB).toFixed(1)} KB de fontes, limite 160 KB`);
  }

  const photoDir = join(rootDir, "src/assets/profile");
  let photoFiles: string[] = [];
  try {
    photoFiles = walk(photoDir, (f) => /photo\.(jpe?g|png|webp|avif)$/i.test(f));
  } catch {
    photoFiles = [];
  }
  for (const photo of photoFiles) {
    const size = statSync(photo).size;
    if (size > 60 * KB) {
      fail("budgets", relative(rootDir, photo), `${(size / KB).toFixed(1)} KB, limite 60 KB`);
    }
  }
}

// ---------- main ----------

function main() {
  const { dist, only } = parseArgs();
  const htmlFiles = walk(dist, (f) => f.endsWith(".html"));

  if (only.includes("external")) checkExternal(htmlFiles, dist);
  if (only.includes("csp")) checkCsp(htmlFiles, dist);
  if (only.includes("i18n")) checkI18n(dist);
  if (only.includes("links")) checkLinks(htmlFiles, dist);
  if (only.includes("budgets")) checkBudgets(dist);

  if (failures.length > 0) {
    console.error(`\ncheck-static: ${failures.length} problema(s) encontrado(s)\n`);
    for (const f of failures) {
      console.error(`  [${f.check}] ${f.file}: ${f.message}`);
    }
    process.exitCode = 1;
  } else {
    console.log("check-static: tudo certo.");
  }
}

main();
