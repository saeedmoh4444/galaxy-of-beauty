import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const ROOMS = [
  {
    id: 1,
    title: 'أسرار العناية بالبشرة ✨',
    host: 'د. ليلى القحطاني',
    listeners: 85,
    category: 'skincare',
    isLive: true,
    emoji: '🎙️',
  },
  {
    id: 2,
    title: 'أحدث صيحات المكياج 💄',
    host: 'نورة العمري',
    listeners: 120,
    category: 'makeup',
    isLive: true,
    emoji: '🎙️',
  },
  {
    id: 3,
    title: 'العناية بالشعر طبيعياً 🌿',
    host: 'سارة الحربي',
    listeners: 45,
    category: 'hair',
    isLive: false,
    emoji: '🎙️',
    scheduledFor: '2026-07-30T20:00:00',
  },
  {
    id: 4,
    title: 'ريادة الأعمال في التجميل 💼',
    host: 'مريم الشمري',
    listeners: 32,
    category: 'business',
    isLive: false,
    emoji: '🎙️',
    scheduledFor: '2026-08-01T19:00:00',
  },
];

export const audioRoomsRouter = router({
  rooms: publicProcedure.query(() => ({
    live: ROOMS.filter((r) => r.isLive),
    upcoming: ROOMS.filter((r) => !r.isLive),
  })),
  join: customerProcedure.input(z.object({ roomId: z.number() })).mutation(async ({ input }) => {
    const room = ROOMS.find((r) => r.id === input.roomId);
    if (room) room.listeners += 1;
    return { joined: true, roomId: input.roomId, listenerCount: room?.listeners ?? 0 };
  }),
});
