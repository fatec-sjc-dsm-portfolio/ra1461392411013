import { test, expect } from "@playwright/test";

// "about" fica fora: seção desativada (D-38 em docs/SPEC.md).
const SECTION_ORDER = ["intro", "experience", "skills", "projects", "testimonials", "contact"];

const API_ORDER = ["Shifu", "Animus", "Gaia", "Chronos", "Stocker", "Smart Farming"];

for (const locale of ["pt", "en"]) {
  test(`${locale}/ has the sections in the required order`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const ids = await page.locator("main > section").evaluateAll((sections) =>
      sections.map((el) => el.id),
    );
    expect(ids).toEqual(SECTION_ORDER);
  });

  test(`${locale}/ shows the 6 API cards in the required order, academic tab first`, async ({
    page,
  }) => {
    await page.goto(`${locale}/`);
    await expect(page.locator("#panel-academic")).toBeVisible();
    await expect(page.locator("#panel-personal")).toBeHidden();
    const titles = await page.locator("#panel-academic article h3").allInnerTexts();
    expect(titles.map((t) => t.replace(/\.$/, ""))).toEqual(API_ORDER);
  });

  test(`${locale}/ every project card has a contribution list`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const cards = page.locator("#projects article");
    const count = await cards.count();
    expect(count).toBe(7);
    for (let i = 0; i < count; i++) {
      const items = await cards.nth(i).locator("ul li").count();
      expect(items).toBeGreaterThan(0);
    }
  });

  test(`${locale}/ tabs switch without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${locale}/`);

    await expect(page.locator("#panel-academic")).toBeVisible();
    await expect(page.locator("#panel-personal")).toBeHidden();

    await page.locator('label[for="tab-personal"]').click();

    await expect(page.locator("#panel-personal")).toBeVisible();
    await expect(page.locator("#panel-academic")).toBeHidden();
    await expect(page.locator("#panel-personal")).toContainText("InVuecer");

    await context.close();
  });

  test(`${locale}/ the journey timeline has 3 entries, newest first`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const items = page.locator("#experience .timeline__item");
    expect(await items.count()).toBe(3);

    const titles = await items.locator("h3").allInnerTexts();
    expect(titles.map((t) => t.trim().replace(/\.$/, ""))).toEqual([
      "Tecsus",
      "Tecsus",
      "Fatec São José dos Campos",
    ]);

    // Every entry carries its own bullet points.
    for (let i = 0; i < 3; i++) {
      const bullets = await items.nth(i).locator(".timeline__highlights > li").count();
      expect(bullets).toBeGreaterThan(0);
    }
  });

  test(`${locale}/ the junior role keeps the 4 Tecsus contributions`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const current = page.locator("#experience .timeline__item").first();
    expect(await current.locator(".timeline__highlights > li").count()).toBe(4);
  });

  test(`${locale}/ shows InVuecer in the personal tab`, async ({ page }) => {
    await page.goto(`${locale}/`);
    await page.locator('label[for="tab-personal"]').click();
    await expect(page.locator("#panel-personal")).toBeVisible();
    await expect(page.locator("#panel-personal")).toContainText("InVuecer");
    await expect(page.locator("#panel-academic")).toBeHidden();
  });

  test(`${locale}/ header stays visible while scrolling on desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${locale}/`);
    await page.evaluate(() => window.scrollTo(0, 3000));

    const header = page.locator(".site-header");
    await expect(header).toBeInViewport();
    const box = await header.boundingBox();
    expect(box?.y).toBeLessThan(5);
  });

  test(`${locale}/ anchors land below the sticky header`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${locale}/`);
    await page.locator('.site-header a[href="#projects"]').click();
    await page.waitForTimeout(800);

    const { headerBottom, sectionTop } = await page.evaluate(() => ({
      headerBottom: document.querySelector(".site-header")!.getBoundingClientRect().bottom,
      sectionTop: document.querySelector("#projects")!.getBoundingClientRect().top,
    }));
    expect(sectionTop).toBeGreaterThanOrEqual(headerBottom - 2);
  });

  test(`${locale}/ the home link goes back to the top`, async ({ page }) => {
    await page.goto(`${locale}/`);
    await page.evaluate(() => window.scrollTo(0, 2500));
    await page.locator('.site-header__nav a[href="#intro"]').click();
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);
  });

  test(`${locale}/ the testimonial carousel is keyboard reachable`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const carousel = page.locator("#testimonials .carousel");
    await expect(carousel).toBeVisible();

    // Região com rolagem precisa ser alcançável pelo teclado.
    await expect(carousel).toHaveAttribute("tabindex", "0");
    await expect(carousel).toHaveAttribute("role", "region");

    const cards = carousel.locator(".testimonial");
    expect(await cards.count()).toBeGreaterThan(0);
    // Cada card traz a fala e o cargo de quem falou.
    await expect(cards.first().locator("blockquote")).not.toBeEmpty();
    await expect(cards.first().locator(".testimonial__role")).not.toBeEmpty();
  });

  test(`${locale}/ has the photo slot`, async ({ page }) => {
    await page.goto(`${locale}/`);
    const slot = page.locator(".photo-slot");
    await expect(slot.first()).toBeVisible();
    await expect(slot.first()).toHaveAttribute("data-state", /photo|placeholder/);
  });
}
