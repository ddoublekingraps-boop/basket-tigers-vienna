import { defineConfig } from 'astro/config';

export default defineConfig({
  // Produktions-Domain: Basis für Canonicals, Sitemap und Open-Graph-URLs.
  site: 'https://viennabasket-tigers.at',
  build: {
    // Seiten werden als /pfad/index.html gebaut und unter /pfad/ ausgeliefert.
    // Passt zu den Canonicals in src/data/seo.ts.
    format: 'directory',
  },
});
