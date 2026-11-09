import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const destDir = join(rootDir, "src/assets/fonts");
const licensesDir = join(rootDir, "public/licenses");

interface FontSource {
  package: string;
  file: string;
  destName: string;
  licenseFile: string;
  licenseDestName: string;
}

const fonts: FontSource[] = [
  {
    package: "@fontsource-variable/newsreader",
    file: "newsreader-latin-wght-normal.woff2",
    destName: "newsreader-latin-wght-normal.woff2",
    licenseFile: "LICENSE",
    licenseDestName: "OFL-newsreader.txt",
  },
  {
    package: "@fontsource-variable/public-sans",
    file: "public-sans-latin-wght-normal.woff2",
    destName: "public-sans-latin-wght-normal.woff2",
    licenseFile: "LICENSE",
    licenseDestName: "OFL-public-sans.txt",
  },
  {
    package: "@fontsource-variable/jetbrains-mono",
    file: "jetbrains-mono-latin-wght-normal.woff2",
    destName: "jetbrains-mono-latin-wght-normal.woff2",
    licenseFile: "LICENSE",
    licenseDestName: "OFL-jetbrains-mono.txt",
  },
];

mkdirSync(destDir, { recursive: true });
mkdirSync(licensesDir, { recursive: true });

for (const font of fonts) {
  const packageDir = dirname(
    fileURLToPath(import.meta.resolve(`${font.package}/package.json`)),
  );
  copyFileSync(join(packageDir, "files", font.file), join(destDir, font.destName));
  copyFileSync(join(packageDir, font.licenseFile), join(destDir, font.licenseDestName));
  copyFileSync(join(packageDir, font.licenseFile), join(licensesDir, font.licenseDestName));
  console.log(`Vendored ${font.destName}`);
}
