import { test, expect } from "@playwright/test";

const PAGES = ["", "pt/", "en/", "this-page-does-not-exist/"];
const THEMES = ["light", "dark"] as const;

for (const path of PAGES) {
  for (const theme of THEMES) {
    test(`${path} has no external requests or console errors (${theme})`, async ({ page }) => {
      const externalRequests: string[] = [];
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => pageErrors.push(err.message));
      page.on("requestfailed", (req) => failedRequests.push(req.url()));

      await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.hostname !== "127.0.0.1") {
          externalRequests.push(url.href);
          return route.abort();
        }
        return route.continue();
      });

      await page.emulateMedia({ colorScheme: theme });
      const response = await page.goto(path);
      await page.waitForLoadState("networkidle");

      // A missing route legitimately returns an HTTP 404 for the document
      // itself; Chromium always logs that as a console error, independent
      // of whether the 404 page's own content and links are correct.
      const relevantConsoleErrors =
        path === "this-page-does-not-exist/"
          ? consoleErrors.filter((msg) => !/404/.test(msg))
          : consoleErrors;

      expect(externalRequests, `external requests on ${path}`).toEqual([]);
      expect(relevantConsoleErrors, `console errors on ${path}`).toEqual([]);
      expect(pageErrors, `page errors on ${path}`).toEqual([]);
      expect(failedRequests, `failed requests on ${path}`).toEqual([]);

      const cookies = await page.context().cookies();
      expect(cookies, `cookies on ${path}`).toEqual([]);

      if (path !== "this-page-does-not-exist/") {
        expect(response?.status()).toBeLessThan(400);
      }
    });
  }
}
