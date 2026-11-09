import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const fontsDir = join(rootDir, "src/assets/fonts");
const ogDir = join(rootDir, "public/og");
const templatePath = join(rootDir, "scripts/og-template.html");
const tmpDir = join(rootDir, ".tmp/og");

mkdirSync(ogDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const pages = [
  {
    file: "og-pt-BR.png",
    title: "Kauan Fonseca",
    subtitle: "Desenvolvedor Full-Stack · Júnior",
  },
  {
    file: "og-en-US.png",
    title: "Kauan Fonseca",
    subtitle: "Full-Stack Developer · Junior",
  },
];

async function main() {
  const browser = await chromium.launch();
  const template = readFileSync(templatePath, "utf-8").replace(/FONTS_DIR/g, fontsDir);

  for (const page of pages) {
    const html = template
      .replace(">TITLE<", `>${page.title}<`)
      .replace(">SUBTITLE<", `>${page.subtitle}<`);
    const htmlPath = join(tmpDir, page.file.replace(".png", ".html"));
    writeFileSync(htmlPath, html);

    const browserPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await browserPage.goto(`file://${htmlPath}`);
    await browserPage.screenshot({ path: join(ogDir, page.file) });
    await browserPage.close();
    console.log(`Built ${page.file}`);
  }

  const iconHtml = `<!doctype html><html><head><style>
    body{margin:0;width:180px;height:180px;background:#0F5E73;display:flex;align-items:center;justify-content:center;}
    span{font-family:Georgia,serif;font-weight:700;font-size:72px;color:#FAFAF7;}
  </style></head><body><span>KF</span></body></html>`;
  const iconPath = join(tmpDir, "icon.html");
  writeFileSync(iconPath, iconHtml);
  const iconPage = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await iconPage.goto(`file://${iconPath}`);
  await iconPage.screenshot({ path: join(rootDir, "public/apple-touch-icon.png") });
  await iconPage.close();
  console.log("Built apple-touch-icon.png");

  await browser.close();
  rmSync(tmpDir, { recursive: true, force: true });
}

main();
