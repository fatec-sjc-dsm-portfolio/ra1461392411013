// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  // Repositório de projeto numa organização: o Pages publica em
  // <org>.github.io/<repo>/, então o site vive num sub-path.
  site: process.env.SITE ?? "https://fatec-sjc-dsm-portfolio.github.io",
  base: process.env.BASE ?? "/ra1461392411013/",
  outDir: process.env.OUT_DIR ?? "dist",
  trailingSlash: "always",
  build: {
    format: "directory",
    // The CSP meta tag is written by hand as the first child of <head>
    // (see src/lib/csp.ts and B.5's "Plano B"), because Astro's built-in
    // security.csp injects its <meta> at the end of <head>, after our own
    // links/scripts/styles, which breaks the "CSP first" requirement.
    // Inlining stylesheets would require per-page style-src hashes that a
    // static hand-written meta can't track, so everything stays external.
    inlineStylesheets: "never",
  },
  vite: {
    build: {
      // Sem isto o Vite embute assets pequenos como data: URI. A CSP tem
      // img-src 'self' sem data:, e mask-image com data: seria bloqueada
      // (RNF-02). Com 0, todo asset vira arquivo da mesma origem.
      assetsInlineLimit: 0,
    },
  },
});
