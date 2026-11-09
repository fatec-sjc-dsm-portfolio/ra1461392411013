import { test, expect, type Browser } from "@playwright/test";

interface Scenario {
  name: string;
  locale: string;
  timezoneId: string;
  expected: "pt" | "en";
}

const SCENARIOS: Scenario[] = [
  { name: "pt-BR", locale: "pt-BR", timezoneId: "America/Sao_Paulo", expected: "pt" },
  { name: "pt-PT, Lisbon timezone", locale: "pt-PT", timezoneId: "Europe/Lisbon", expected: "pt" },
  { name: "en-US, São Paulo timezone", locale: "en-US", timezoneId: "America/Sao_Paulo", expected: "pt" },
  { name: "en-US, New York timezone", locale: "en-US", timezoneId: "America/New_York", expected: "en" },
  { name: "es-AR, Buenos Aires timezone", locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires", expected: "en" },
];

async function newLocaleContext(
  browser: Browser,
  locale: string,
  timezoneId: string,
  javaScriptEnabled = true,
) {
  return browser.newContext({ locale, timezoneId, javaScriptEnabled });
}

for (const scenario of SCENARIOS) {
  test(`language detection: ${scenario.name}`, async ({ browser }) => {
    const context = await newLocaleContext(browser, scenario.locale, scenario.timezoneId);
    const page = await context.newPage();
    await page.goto("");
    await page.waitForURL(`**/${scenario.expected}/**`);
    expect(page.url()).toContain(`/${scenario.expected}/`);
    await context.close();
  });
}

test("saved choice (en) overrides pt-BR browser", async ({ browser }) => {
  const context = await newLocaleContext(browser, "pt-BR", "America/Sao_Paulo");
  const page = await context.newPage();
  await page.addInitScript(() => window.localStorage.setItem("kf:lang", "en"));
  await page.goto("");
  await page.waitForURL("**/en/**");
  expect(page.url()).toContain("/en/");
  await context.close();
});

test("JavaScript disabled shows the static language gate without redirecting", async ({ browser }) => {
  const context = await newLocaleContext(browser, "pt-BR", "America/Sao_Paulo", false);
  const page = await context.newPage();
  await page.goto("");
  await expect(page.locator('a[hreflang="pt-BR"]')).toBeVisible();
  await expect(page.locator('a[hreflang="en-US"]')).toBeVisible();
  expect(page.url()).toMatch(/\/$/);
  await context.close();
});

test("saved choice (en) does not redirect away from /pt/", async ({ page }) => {
  await page.goto("pt/#experience");
  await page.evaluate(() => window.localStorage.setItem("kf:lang", "en"));
  await page.goto("pt/");
  expect(page.url()).toContain("/pt/");
});

test("language switch goes to the equivalent page, keeps the anchor and remembers the choice", async ({ page }) => {
  await page.goto("pt/#experience");
  await page.locator("[data-lang-shortcut]").click();
  await page.waitForURL("**/en/**");
  expect(page.url()).toContain("/en/#experience");
  const stored = await page.evaluate(() => window.localStorage.getItem("kf:lang"));
  expect(stored).toBe("en");
});

test("the language shortcut is visible in the header", async ({ page }) => {
  await page.goto("pt/");
  const shortcut = page.locator("[data-lang-shortcut]");
  await expect(shortcut).toBeVisible();
  // O prefixo "Mudar idioma para" é oculto visualmente, mas entra no nome
  // acessível de propósito: sozinho, "English" não diz o que o link faz.
  await expect(shortcut).toContainText("English");
  await expect(shortcut).toHaveAccessibleName(/Mudar idioma para\s+English/);

  await page.goto("en/");
  await expect(page.locator("[data-lang-shortcut]")).toContainText("Português");
});

test("the theme switch flips, persists and survives a reload", async ({ page }) => {
  await page.goto("pt/");
  const toggle = page.locator("[data-theme-toggle]");
  await expect(toggle).toBeVisible();

  // Sem escolha salva, reflete o sistema (o padrão do Playwright é claro).
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("kf:theme"))).toBe("dark");

  // Sobrevive ao reload, e sem piscar: o script é síncrono no <head>.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-theme-toggle]")).toHaveAttribute("aria-checked", "true");

  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("the switch starts checked when the system prefers dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("pt/");
  await expect(page.locator("[data-theme-toggle]")).toHaveAttribute("aria-checked", "true");
  await context.close();
});

test("without JavaScript the switch is hidden and language still works", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("pt/");

  // Controle morto é pior que controle nenhum: sem JS ele não aparece.
  await expect(page.locator("[data-theme-toggle]")).toBeHidden();

  // O idioma continua sendo link de verdade (RF-13).
  await page.locator("[data-lang-shortcut]").click();
  await page.waitForURL("**/en/**");
  expect(page.url()).toContain("/en/");

  await context.close();
});

test("content is fully available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const path of ["pt/", "en/"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const links = await page.locator("a[href]").count();
    expect(links).toBeGreaterThan(5);
  }

  await context.close();
});
