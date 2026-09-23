import { defineCollection, z } from 'astro:content';
import { parseGameDate, DEFAULT_TEAM } from '../lib/games';

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
    // Eigene Mannschaft, z.B. "Tigers H1" (leer -> "Tigers")
    team: z.string().nullish(),
    // Heim- oder Auswaertsspiel (leer -> Heim)
    venue: z.string().nullish(),
    opponent: z.string(),
    location: z.string().nullish(),
  }).transform((g) => {
    const { date, hasTime } = parseGameDate(g.date);
    const raw = typeof g.date === 'string' ? g.date.trim() : '';
    return {
      opponent: g.opponent.trim(),
      team: g.team?.trim() || DEFAULT_TEAM,
      isHome: !/^ausw/i.test((g.venue ?? '').trim()),
      location: (g.location ?? '').trim(),
      date,                                   // echtes Date oder null (= TBD)
      hasTime,                                // false -> Uhrzeit TBD
      dateText: date ? '' : (raw && !/^tbd$/i.test(raw) ? raw : 'TBD'), // Anzeige-Text wenn kein Datum erkannt
    };
  }),
});

const trainings = defineCollection({
  type: 'content',
  schema: z.object({
    weekday: z.string(),
    time: z.string(),
    location: z.string(),
    note: z.string().optional(),
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
