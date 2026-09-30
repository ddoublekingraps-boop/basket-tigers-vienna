// Kurzvorschau fuer News auf der Startseite.
// Macht aus Markdown kurzen Text, laesst Links aber klickbar.
// Erkannt werden: [Text](https://...), <https://...> und nackte https://... Links.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Lange URLs kuerzer anzeigen: "https://www.instagram.com/p/abc/?hl=en" -> "instagram.com/p/abc" */
const prettyUrl = (url: string) => {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, '');
    return u.hostname.replace(/^www\./, '') + path;
  } catch { return url; }
};

const cleanText = (s: string) => s
  .replace(/\\\n/g, ' ')            // Markdown-Zeilenumbruch "\"
  .replace(/[*_`>#~\\]/g, '')
  .replace(/\s+/g, ' ');

type Seg = { text: string; href?: string };

export function teaserHtml(md: string, max = 110): string {
  const src = (md || '').replace(/!\[[^\]]*\]\([^)]*\)/g, ''); // Bilder raus
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)[^)]*\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()]+[^\s<>().,!?;:'"])/g;
  const segs: Seg[] = [];
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) segs.push({ text: cleanText(src.slice(last, m.index)) });
    if (m[1]) segs.push({ text: cleanText(m[1]).trim(), href: m[2] });
    else { const url = m[3] || m[4]; segs.push({ text: prettyUrl(url), href: url }); }
    last = m.index + m[0].length;
  }
  if (last < src.length) segs.push({ text: cleanText(src.slice(last)) });

  // Kuerzen: Text wird abgeschnitten, Links bleiben immer ganz
  let used = 0, out = '', cut = false;
  for (let i = 0; i < segs.length; i++) {
    let { text, href } = segs[i];
    if (i === 0) text = text.replace(/^\s+/, '');
    if (!text) continue;
    if (used >= max) { cut = true; break; }
    if (href) {
      out += `<a class="news-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`;
      used += text.length;
    } else if (used + text.length > max) {
      out += esc(text.slice(0, max - used).replace(/\s+\S*$/, '')); cut = true; break;
    } else {
      out += esc(text); used += text.length;
    }
  }
  return out.replace(/\s+$/, '') + (cut ? '…' : '');
}
