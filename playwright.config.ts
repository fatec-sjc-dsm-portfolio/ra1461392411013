import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    // Termina em "/" e os testes navegam com caminho relativo ("pt/"), para o
    // sub-path do Pages (astro.config.mjs → base) entrar na URL resolvida.
    baseURL: "http://127.0.0.1:4321/ra1461392411013/",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4321/ra1461392411013/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
