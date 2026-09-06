import { defineCollection, z } from 'astro:content';

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
    date: z.preprocess((val) => {
      if (val === undefined || val === null || val === '') return 'TBD';
      if (val instanceof Date) {
        return isNaN(val.getTime()) ? 'TBD' : val;
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed.toUpperCase() === 'TBD') return 'TBD';
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed;
        return trimmed;
      }
      return val;
    }, z.union([z.date(), z.string()]).optional().default('TBD')),
    opponent: z.string(),
    location: z.string(),
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
