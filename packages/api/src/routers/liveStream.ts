import { z } from 'zod';
import { publicProcedure, customerProcedure, router } from '../trpc';

export interface LiveStream {
  id: number; technicianId: number; technicianName: string;
  titleAr: string; titleEn: string; category: string;
  streamUrl: string; thumbnailUrl: string | null;
  isLive: boolean; viewerCount: number; startedAt: string;
}
export interface LiveChatMessage { id: number; streamId: number; userId: number; userName: string; message: string; createdAt: string; }

const streams: LiveStream[] = [
  { id: 1, technicianId: 1, technicianName: 'نورة العمري', titleAr: 'مكياج سهرة مباشر', titleEn: 'Live Evening Makeup', category: 'makeup', streamUrl: 'https://www.youtube.com/embed/live_stream?channel=makeup', thumbnailUrl: null, isLive: true, viewerCount: 247, startedAt: new Date().toISOString() },
  { id: 2, technicianId: 2, technicianName: 'سارة الحربي', titleAr: 'تسريحة شعر للعرايس', titleEn: 'Bridal Hair Live', category: 'hair', streamUrl: 'https://www.youtube.com/embed/live_stream?channel=hair', thumbnailUrl: null, isLive: true, viewerCount: 183, startedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, technicianId: 3, technicianName: 'د. ليلى القحطاني', titleAr: 'روتين العناية بالبشرة', titleEn: 'Skincare Routine Live', category: 'skincare', streamUrl: 'https://www.youtube.com/embed/live_stream?channel=skincare', thumbnailUrl: null, isLive: false, viewerCount: 0, startedAt: new Date(Date.now() + 86400000).toISOString() },
];
const chatMessages: LiveChatMessage[] = [];
let msgId = 1;

const CATEGORIES = [
  { key: 'makeup', nameAr: 'مكياج', emoji: '💄' },
  { key: 'hair', nameAr: 'شعر', emoji: '💇‍♀️' },
  { key: 'skincare', nameAr: 'عناية بالبشرة', emoji: '✨' },
  { key: 'nails', nameAr: 'أظافر', emoji: '💅' },
];

export const liveStreamRouter = router({
  list: publicProcedure.query(() => {
    const live = streams.filter((s) => s.isLive);
    const upcoming = streams.filter((s) => !s.isLive);
    return { live, upcoming, categories: CATEGORIES };
  }),
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const stream = streams.find((s) => s.id === input.id);
    if (!stream) throw new Error('البث غير موجود');
    return stream;
  }),
  chat: publicProcedure.input(z.object({ streamId: z.number() })).query(async ({ input }) =>
    chatMessages.filter((m) => m.streamId === input.streamId).slice(-50)
  ),
  sendMessage: customerProcedure
    .input(z.object({ streamId: z.number(), message: z.string().min(1).max(300) }))
    .mutation(async ({ ctx, input }) => {
      const msg: LiveChatMessage = {
        id: msgId++, streamId: input.streamId, userId: ctx.user.id,
        userName: ctx.user.email, message: input.message, createdAt: new Date().toISOString(),
      };
      chatMessages.push(msg);
      return msg;
    }),
});
