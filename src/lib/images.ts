import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type ImageSize = { width: number; height: number };

/** Cache, damit dieselbe Datei pro Build nur einmal gelesen wird. */
const sizeCache = new Map<string, ImageSize | null>();

/**
 * Liest die echten Pixelmasse einer Datei aus `public/` zur Build-Zeit.
 *
 * Damit koennen wir `width`/`height` am <img> ausgeben, ohne ein
 * Seitenverhaeltnis zu erfinden: der Browser reserviert den Platz aus den
 * Attributen (kein CLS) und das Bild behaelt seine echten Proportionen.
 *
 * Gibt `null` zurueck fuer externe URLs oder unlesbare/unbekannte Formate --
 * dann werden einfach keine Attribute gesetzt.
 */
export function getImageSize(publicPath: string | undefined): ImageSize | null {
  if (!publicPath || /^(https?:)?\/\//.test(publicPath) || publicPath.startsWith("data:")) return null;

  const key = publicPath;
  if (sizeCache.has(key)) return sizeCache.get(key)!;

  let size: ImageSize | null = null;
  try {
    let rel = publicPath.replace(/^\/+/, "").split(/[?#]/)[0];
    try { rel = decodeURIComponent(rel); } catch { /* Pfad war nicht kodiert */ }
    const file = fileURLToPath(new URL(`../../public/${rel}`, import.meta.url));
    size = parseSize(readFileSync(file), rel);
  } catch {
    size = null;
  }

  sizeCache.set(key, size);
  return size;
}

function parseSize(buf: Buffer, name: string): ImageSize | null {
  // PNG: IHDR-Chunk liegt fest an Offset 16
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: Logical Screen Descriptor, little-endian
  if (buf.length > 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP: RIFF-Container mit VP8 / VP8L / VP8X
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      const w = buf.readUIntLE(24, 3) + 1;
      const h = buf.readUIntLE(27, 3) + 1;
      return { width: w, height: h };
    }
    return null;
  }

  // JPEG: Segmente durchlaufen bis zum ersten SOF-Marker
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0..SOF15 ohne die Nicht-SOF-Marker DHT/JPG/DAC
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) {
        i += 2;
        continue;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }

  // SVG: width/height, sonst viewBox
  if (/\.svg$/i.test(name)) {
    const svg = buf.toString("utf8", 0, Math.min(buf.length, 4096));
    const w = /\bwidth\s*=\s*["']([\d.]+)/.exec(svg);
    const h = /\bheight\s*=\s*["']([\d.]+)/.exec(svg);
    if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
    const vb = /\bviewBox\s*=\s*["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(svg);
    if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
  }

  return null;
}

/** Breite, in der Sponsorlogos ausgeliefert werden (2x des Anzeigemasses). */
export const SPONSOR_LOGO_WIDTH = 600;

/**
 * Optimierte Logo-URL. In Produktion liefert die Netlify Image CDN WebP in der
 * benoetigten Breite aus -- absichtlich nur `w`, damit das Original-
 * Seitenverhaeltnis erhalten bleibt (kein `h`, kein `fit`, kein Beschnitt).
 */
export function sponsorLogoUrl(logo: string, width = SPONSOR_LOGO_WIDTH): string {
  if (import.meta.env.PROD && logo.startsWith("/")) {
    return `/.netlify/images?url=${encodeURIComponent(logo)}&w=${width}&fm=webp&q=85`;
  }
  return logo;
}

/**
 * Masse des tatsaechlich ausgelieferten Logos -- also proportional auf
 * `SPONSOR_LOGO_WIDTH` heruntergerechnet, falls das Original groesser ist.
 * Dient als `width`/`height` am <img>: echtes Seitenverhaeltnis, kein CLS.
 */
export function sponsorLogoSize(logo: string | undefined): ImageSize | null {
  const size = getImageSize(logo);
  if (!size || size.width <= SPONSOR_LOGO_WIDTH) return size;
  return {
    width: SPONSOR_LOGO_WIDTH,
    height: Math.round((size.height * SPONSOR_LOGO_WIDTH) / size.width),
  };
}
