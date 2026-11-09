import type { APIRoute } from "astro";
import { withBase } from "../lib/paths";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://fatec-sjc-dsm-portfolio.github.io");

  const url = (path: string) => new URL(withBase(path), base).href;

  const alternates = `
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${url("pt/")}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${url("en/")}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url("")}" />`;

  const entries = [url(""), url("pt/"), url("en/")]
    .map(
      (loc) => `  <url>
    <loc>${loc}</loc>${alternates}
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
