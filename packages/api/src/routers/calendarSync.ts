import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const SYNC_STATUS = {
  connected: false,
  lastSynced: null as string | null,
  upcomingEvents: 0,
  provider: 'google' as const,
};

export const calendarSyncRouter = router({
  status: customerProcedure.query(() => SYNC_STATUS),
  connect: customerProcedure.input(z.object({ authCode: z.string().min(1) })).mutation(async () => {
    SYNC_STATUS.connected = true;
    SYNC_STATUS.lastSynced = new Date().toISOString();
    SYNC_STATUS.upcomingEvents = 5;
    return { connected: true, message: 'تم ربط التقويم بنجاح! ', upcomingEvents: 5 };
  }),
  disconnect: customerProcedure.mutation(async () => {
    SYNC_STATUS.connected = false;
    SYNC_STATUS.lastSynced = null;
    SYNC_STATUS.upcomingEvents = 0;
    return { disconnected: true };
  }),
  upcoming: customerProcedure.query(() => [
    {
      id: 1,
      title: 'حجز مكياج',
      date: '2026-07-30T10:00:00',
      technician: 'نورة العمري',
      emoji: '',
    },
    {
      id: 2,
      title: 'تنظيف بشرة',
      date: '2026-08-02T14:00:00',
      technician: 'د. ليلى القحطاني',
      emoji: '',
    },
  ]),
});
