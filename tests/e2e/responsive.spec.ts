import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 360, height: 640 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const locale of ["pt", "en"]) {
  for (const viewport of VIEWPORTS) {
    test(`${locale}/ has no horizontal scroll at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${locale}/`);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

      await page.screenshot({
        path: `playwright-report/responsive-${locale}-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }
}
