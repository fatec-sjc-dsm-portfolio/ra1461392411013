import type { APIRoute } from "astro";
import { withBase } from "../lib/paths";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://fatec-sjc-dsm-portfolio.github.io");
  const sitemapUrl = new URL(withBase("sitemap.xml"), base).href;

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
};
