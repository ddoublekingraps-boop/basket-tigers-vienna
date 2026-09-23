// Hilfsfunktionen fuer Spiele (Datum parsen, formatieren, Team-Namen).
//
// Im Admin-Panel wird das Datum als Text eingetragen, z.B. "26.09.2026 20:00".
// Dieses Format versteht JavaScript nicht von selbst - daher der eigene Parser.
// Unterstuetzt werden:
//   26.09.2026 20:00   | 26.09.2026, 20:00 | 26.9.26 20.00  -> Datum + Uhrzeit (Wiener Zeit)
//   26.09.2026                                            -> nur Datum, Uhrzeit TBD
//   2026-09-26T20:00:00+02:00 | 2026-09-26 20:00          -> ISO
//   leer / TBD                                            -> Termin noch offen

export const TZ = 'Europe/Vienna';
export const DEFAULT_TEAM = 'Tigers';

export type ParsedGameDate = { date: Date | null; hasTime: boolean };

/** Offset (ms) der Zeitzone Wien zu einem bestimmten UTC-Zeitpunkt. */
function viennaOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - utcMs;
}

/** Wandelt eine Wiener Ortszeit in ein echtes Date (UTC) um - inkl. Sommer-/Winterzeit. */
export function viennaLocalToDate(y: number, mo: number, d: number, h = 0, mi = 0): Date | null {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let ms = guess - viennaOffsetMs(guess);
  ms = guess - viennaOffsetMs(ms);
  const out = new Date(ms);
  if (isNaN(out.getTime())) return null;
  // Plausibilitaet: 31.02. o.ae. ablehnen
  const check = new Date(guess);
  if (check.getUTCDate() !== d || check.getUTCMonth() !== mo - 1) return null;
  return out;
}

export function parseGameDate(val: unknown): ParsedGameDate {
  if (val === undefined || val === null) return { date: null, hasTime: false };

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return { date: null, hasTime: false };
    // YAML macht aus "2026-09-26" ein Date um 00:00 UTC -> das ist ein reines Datum
    const dateOnly = val.getUTCHours() === 0 && val.getUTCMinutes() === 0 && val.getUTCSeconds() === 0;
    if (dateOnly) {
      return { date: viennaLocalToDate(val.getUTCFullYear(), val.getUTCMonth() + 1, val.getUTCDate(), 12, 0), hasTime: false };
    }
    return { date: val, hasTime: true };
  }

  if (typeof val !== 'string') return { date: null, hasTime: false };
  const s = val.trim();
  if (!s || /^tbd$/i.test(s)) return { date: null, hasTime: false };

  // Deutsches Format: TT.MM.JJJJ [HH:MM]
  const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})(?:[,\s]+(?:um\s+)?(\d{1,2})[:.](\d{2})(?:\s*uhr)?)?$/i);
  if (de) {
    const [, d, mo, yRaw, h, mi] = de;
    const y = yRaw.length === 2 ? 2000 + Number(yRaw) : Number(yRaw);
    const hasTime = h !== undefined;
    // ohne Uhrzeit: 12:00 als Platzhalter (fuer Sortierung/7-Tage-Filter), angezeigt wird "TBD"
    const date = viennaLocalToDate(y, Number(mo), Number(d), hasTime ? Number(h) : 12, hasTime ? Number(mi) : 0);
    return { date, hasTime: hasTime && !!date };
  }

  // ISO ohne Zeitzone: JJJJ-MM-TT [HH:MM] -> als Wiener Zeit interpretieren
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::\d{2})?)?$/);
  if (iso) {
    const [, y, mo, d, h, mi] = iso;
    const hasTime = h !== undefined;
    const date = viennaLocalToDate(Number(y), Number(mo), Number(d), hasTime ? Number(h) : 12, hasTime ? Number(mi) : 0);
    return { date, hasTime: hasTime && !!date };
  }

  // ISO mit Zeitzone o.ae.
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return { date: parsed, hasTime: true };

  return { date: null, hasTime: false };
}

export const fmtDay = (d: Date) =>
  d.toLocaleDateString('de-AT', { timeZone: TZ, weekday: 'short', day: '2-digit', month: 'short' });

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('de-AT', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

export const fmtTime = (d: Date) =>
  d.toLocaleTimeString('de-AT', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
