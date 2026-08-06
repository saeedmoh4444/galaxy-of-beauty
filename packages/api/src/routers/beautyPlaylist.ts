import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const beautyPlaylistRouter = router({
  list: publicProcedure
    .input(z.object({ mood: z.string().optional(), limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const where = input.mood ? { mood: input.mood } : {};
      return prisma.beautyPlaylist.findMany({ where, orderBy: { createdAt: 'desc' }, take: input.limit });
    }),

  moods: publicProcedure.query(async () => {
    const playlists = await prisma.beautyPlaylist.findMany({ select: { mood: true } });
    return [...new Set(playlists.map((p) => p.mood))];
  }),

  create: adminProcedure
    .input(z.object({ title: z.string().min(2).max(200), mood: z.string(), tracksJson: z.array(z.object({ title: z.string(), duration: z.string(), emoji: z.string() })) }))
    .mutation(async ({ input }) => {
      return prisma.beautyPlaylist.create({ data: { title: input.title, mood: input.mood, tracksJson: input.tracksJson } });
    }),
});
