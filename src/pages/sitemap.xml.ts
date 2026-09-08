import type { APIRoute } from "astro";
import { PAGES, SITE_URL } from "../data/seo";

/**
 * Sitemap wird beim Build aus src/data/seo.ts erzeugt und liegt unter /sitemap.xml.
 * Neue Seiten müssen nur in PAGES ergänzt werden – Meta-Tags und Sitemap
 * bleiben dadurch automatisch synchron.
 */
export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().split("T")[0];

  const urls = PAGES.map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
