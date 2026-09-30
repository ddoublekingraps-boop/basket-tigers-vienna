import { defineCollection, z } from 'astro:content';
import { parseGameDate, parseResult, normalizeTeam } from '../lib/games';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

const spieler = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    number: z.number().int().optional(),
    team: z.string(),
    position: z.string().optional().default('Spieler'),
    photo: z.string().optional(),
  }),
});

const teams = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    league: z.string().optional(),
  }),
});

const games = defineCollection({
  type: 'content',
  schema: z.object({
    // Datum als Text aus dem Admin-Panel, z.B. "26.09.2026 20:00" (oder leer / TBD)
    date: z.any().optional(),
    // Eigene Mannschaft, z.B. "Tigers/1" (leer -> "Tigers")
    team: z.string().nullish(),
    // Heim- oder Auswaertsspiel (leer -> Heim)
    venue: z.string().nullish(),
    opponent: z.string(),
    location: z.string().nullish(),
    // Ergebnis: Sieg / Niederlage / Abbruch / Verschoben (leer = noch nicht gespielt)
    status: z.string().nullish(),
    score_us: z.any().optional(),
    score_them: z.any().optional(),
  }).transform((g) => {
    const { date, hasTime } = parseGameDate(g.date);
    const { result, score } = parseResult(g.status, g.score_us, g.score_them);
    const raw = typeof g.date === 'string' ? g.date.trim() : '';
    return {
      opponent: g.opponent.trim(),
      team: normalizeTeam(g.team),
      isHome: !/^ausw/i.test((g.venue ?? '').trim()),
      location: (g.location ?? '').trim(),
      date,                                   // echtes Date oder null (= TBD)
      hasTime,                                // false -> Uhrzeit TBD
      result,                                 // 'win' | 'loss' | 'abandoned' | 'postponed' | null
      score,                                  // z.B. "78 : 65" (Tigers zuerst) oder ''
      dateText: date ? '' : (raw && !/^tbd$/i.test(raw) ? raw : 'TBD'), // Anzeige-Text wenn kein Datum erkannt
    };
  }),
});

const WEEKDAYS = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

const trainings = defineCollection({
  type: 'content',
  schema: z.object({
    // Team, z.B. "Herren 1"
    team: z.string().nullish(),
    // Mehrere Tage moeglich (Admin-Panel: Mehrfachauswahl)
    weekdays: z.union([z.array(z.string()), z.string()]).nullish(),
    // alte Einzel-Auswahl, wird weiterhin verstanden
    weekday: z.string().nullish(),
    time: z.string().nullish(),
    location: z.string().nullish(),
    note: z.string().nullish(),
  }).transform((t) => {
    const raw = t.weekdays ?? t.weekday ?? [];
    const list = (Array.isArray(raw) ? raw : [raw]).map((d) => String(d).trim()).filter(Boolean);
    const days = list.sort((a, b) => {
      const ia = WEEKDAYS.indexOf(a), ib = WEEKDAYS.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return {
      team: (t.team ?? '').trim(),
      days,
      firstDay: days.length ? WEEKDAYS.indexOf(days[0]) : 99,
      time: (t.time ?? '').trim(),
      location: (t.location ?? '').trim(),
      note: (t.note ?? '').trim(),
    };
  }),
});

const sponsoren = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    logo: z.string(),
    url: z.string().optional(),
    tier: z.string().optional(),
  }),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    facebook: z.string().optional(),
    email: z.string().optional(),
  }).passthrough(),
});

export const collections = { news, spieler, teams, games, trainings, sponsoren, site };
