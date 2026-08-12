import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const LOCATIONS = [
  {
    id: 1,
    city: 'الرياض',
    branch: 'الفرع الرئيسي',
    revenue: 450000,
    bookings: 1500,
    staff: 15,
    status: 'active',
  },
  {
    id: 2,
    city: 'جدة',
    branch: 'فرع جدة',
    revenue: 320000,
    bookings: 1100,
    staff: 10,
    status: 'active',
  },
  {
    id: 3,
    city: 'الدمام',
    branch: 'فرع الدمام',
    revenue: 180000,
    bookings: 650,
    staff: 7,
    status: 'pending',
  },
];

export const franchisePortalRouter = router({
  dashboard: customerProcedure.query(() => ({
    totalRevenue: 950000,
    totalBookings: 3250,
    totalStaff: 32,
    locations: LOCATIONS,
    growth: 18,
    pendingApplications: 3,
  })),
  locations: customerProcedure.query(() => LOCATIONS),
  addLocation: customerProcedure
    .input(z.object({ city: z.string().min(1), branch: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const loc = {
        id: LOCATIONS.length + 1,
        city: input.city,
        branch: input.branch,
        revenue: 0,
        bookings: 0,
        staff: 0,
        status: 'pending',
      };
      LOCATIONS.push(loc);
      return loc;
    }),
});
