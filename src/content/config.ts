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
    number: z.number().int(),
    position: z.string(),
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
    date: z.coerce.date(),
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
    tier: z.enum(['Gold','Silver','Bronze']).default('Silver'),
  }),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    instagram: z.string().optional(),
    email: z.string().optional(),
  }).passthrough(),
});

export const collections = { news, spieler, teams, games, trainings, sponsoren, site };
