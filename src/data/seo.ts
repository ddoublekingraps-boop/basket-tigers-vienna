/**
 * Zentrale SEO-Daten: eine Quelle für Titles, Descriptions, Canonicals und Sitemap.
 * Wird von src/layouts/Base.astro und src/pages/sitemap.xml.ts gelesen,
 * damit Meta-Tags und Sitemap nicht auseinanderlaufen können.
 */

export const SITE_URL = "https://viennabasket-tigers.at";
export const SITE_NAME = "Basket Tigers Vienna";
export const LOCALE = "de_AT";

/** Social-Preview-Bild. Aktuell das Vereinslogo (640x640, quadratisch).
 *  TODO: durch ein eigenes Motiv im Format 1200x630 ersetzen. */
export const OG_IMAGE = "/assets/logo.png";
export const OG_IMAGE_WIDTH = 640;
export const OG_IMAGE_HEIGHT = 640;

export type PageSeo = {
  /** Pfad exakt so, wie er ausgeliefert wird (mit Trailing Slash). */
  path: string;
  title: string;
  description: string;
  /** Optional abweichende Social-Texte (nur Startseite). */
  ogTitle?: string;
  ogDescription?: string;
  /** Priorität in der Sitemap. */
  priority: string;
  changefreq: string;
};

export const PAGES: PageSeo[] = [
  {
    path: "/",
    title: "Basket Tigers Vienna – Basketballverein in Wien",
    description:
      "Basket Tigers Vienna – Basketballverein in Wien mit Herren- und U19-Teams. Infos zu Teams, Spielern, Spielen, Training und Vereinsleben.",
    ogTitle: "Basket Tigers Vienna 🐅🏀",
    ogDescription:
      "Basketball. Community. Rudel. Der offizielle Webauftritt der Basket Tigers Vienna.",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    path: "/teams/",
    title: "Teams – Basket Tigers Vienna",
    description:
      "Entdecke die Teams der Basket Tigers Vienna – von der U19 bis zu unseren Herrenmannschaften.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/spieler/",
    title: "Spieler & Kader – Basket Tigers Vienna",
    description:
      "Die Spieler und Kader der Basket Tigers Vienna. Entdecke unsere U19- und Herrenmannschaften.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/spielzeiten/",
    title: "Spiele & Termine – Basket Tigers Vienna",
    description:
      "Alle Spiele, Termine und Gegner der Basket Tigers Vienna auf einen Blick.",
    priority: "0.8",
    changefreq: "weekly",
  },
  {
    path: "/trainingszeiten/",
    title: "Training & Trainingszeiten – Basket Tigers Vienna",
    description:
      "Trainingszeiten und Trainingsorte der Basket Tigers Vienna. Alle Informationen zum Basketballtraining unserer Teams in Wien.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/news/",
    title: "News – Basket Tigers Vienna",
    description:
      "Aktuelle News, Vereinsinformationen und Neuigkeiten rund um die Basket Tigers Vienna.",
    priority: "0.7",
    changefreq: "weekly",
  },
  {
    path: "/verein/",
    title: "Über uns – Basket Tigers Vienna",
    description:
      "Erfahre mehr über Basket Tigers Vienna, unseren Verein, unsere Geschichte und unsere Basketball-Community in Wien.",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    path: "/sponsoren/",
    title: "Sponsoren & Partner – Basket Tigers Vienna",
    description:
      "Unsere Sponsoren und Partner unterstützen die Basket Tigers Vienna und unsere Basketball-Community.",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    path: "/kontakt/",
    title: "Kontakt – Basket Tigers Vienna",
    description:
      "Kontakt zu Basket Tigers Vienna. Alle Informationen für Spieler, Interessenten, Partner und Basketballfans.",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    path: "/impressum/",
    title: "Impressum – Basket Tigers Vienna",
    description: "Impressum und rechtliche Informationen des Vereins Basket Tigers.",
    priority: "0.3",
    changefreq: "yearly",
  },
  {
    path: "/datenschutz/",
    title: "Datenschutz – Basket Tigers Vienna",
    description:
      "Datenschutzerklärung und Informationen zum Datenschutz bei Basket Tigers Vienna.",
    priority: "0.3",
    changefreq: "yearly",
  },
];

/** Normalisiert einen Pfad auf die kanonische Form (immer mit Trailing Slash). */
export function canonicalPath(pathname: string): string {
  let p = pathname.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = "/" + p;
  if (!p.endsWith("/")) p += "/";
  return p;
}

/** Absolute kanonische URL für einen Pfad. */
export function canonicalUrl(pathname: string): string {
  return SITE_URL + canonicalPath(pathname);
}

/** SEO-Eintrag zu einem Pfad, oder undefined für nicht gelistete Seiten (z. B. 404). */
export function seoFor(pathname: string): PageSeo | undefined {
  const p = canonicalPath(pathname);
  return PAGES.find((entry) => entry.path === p);
}
