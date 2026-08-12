import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface SalonStaffMember {
  id: number;
  name: string;
  role: string;
  rating: number;
  bookingsToday: number;
  emoji: string;
}
type SalonStaff = SalonStaffMember;
const STAFF: SalonStaff[] = [
  { id: 1, name: 'نورة العمري', role: 'خبيرة تجميل', rating: 4.9, bookingsToday: 8, emoji: '' },
  { id: 2, name: 'سارة الحربي', role: 'مصففة شعر', rating: 4.8, bookingsToday: 6, emoji: '‍️' },
  { id: 3, name: 'هند المطيري', role: 'أخصائية أظافر', rating: 4.7, bookingsToday: 5, emoji: '' },
];

const SALON_STATS = {
  todayBookings: 19,
  todayRevenue: 4750,
  activeStaff: 3,
  avgRating: 4.8,
  weeklyBookings: [12, 15, 18, 14, 20, 22, 19],
  weeklyRevenue: [3000, 3750, 4500, 3500, 5000, 5500, 4750],
};

export const salonManagementRouter = router({
  dashboard: customerProcedure.query(() => SALON_STATS),
  staff: customerProcedure.query(() => STAFF),
  addStaff: customerProcedure
    .input(z.object({ name: z.string().min(1), role: z.string(), emoji: z.string().default('‍') }))
    .mutation(async ({ input }) => {
      const s: SalonStaff = {
        id: STAFF.length + 1,
        name: input.name,
        role: input.role,
        rating: 4.5,
        bookingsToday: 0,
        emoji: input.emoji,
      };
      STAFF.push(s);
      return s;
    }),
  removeStaff: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const idx = STAFF.findIndex((s) => s.id === input.id);
    if (idx >= 0) STAFF.splice(idx, 1);
    return { success: true };
  }),
});
