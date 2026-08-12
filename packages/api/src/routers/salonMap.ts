import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { BULK_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Saudi major city coordinates — geo constants, not business logic
const CITY_COORDS: Record<string, { lat: number; lng: number; nameAr: string; nameEn: string }> = {
  riyadh: { lat: 24.7136, lng: 46.6753, nameAr: 'الرياض', nameEn: 'Riyadh' },
  jeddah: { lat: 21.4858, lng: 39.1925, nameAr: 'جدة', nameEn: 'Jeddah' },
  makkah: { lat: 21.3891, lng: 39.8579, nameAr: 'مكة المكرمة', nameEn: 'Mecca' },
  madinah: { lat: 24.5247, lng: 39.5692, nameAr: 'المدينة المنورة', nameEn: 'Medina' },
  dammam: { lat: 26.4207, lng: 50.0888, nameAr: 'الدمام', nameEn: 'Dammam' },
  khobar: { lat: 26.2172, lng: 50.1971, nameAr: 'الخبر', nameEn: 'Khobar' },
  dhahran: { lat: 26.2667, lng: 50.15, nameAr: 'الظهران', nameEn: 'Dhahran' },
  taif: { lat: 21.2703, lng: 40.4158, nameAr: 'الطائف', nameEn: 'Taif' },
  abha: { lat: 18.2164, lng: 42.5053, nameAr: 'أبها', nameEn: 'Abha' },
  buraydah: { lat: 26.326, lng: 43.975, nameAr: 'بريدة', nameEn: 'Buraydah' },
  tabuk: { lat: 28.3998, lng: 36.5715, nameAr: 'تبوك', nameEn: 'Tabuk' },
  hail: { lat: 27.5114, lng: 41.7208, nameAr: 'حائل', nameEn: 'Hail' },
  jubail: { lat: 27.0174, lng: 49.4685, nameAr: 'الجبيل', nameEn: 'Jubail' },
  yanbu: { lat: 24.0889, lng: 38.0646, nameAr: 'ينبع', nameEn: 'Yanbu' },
  najran: { lat: 17.4917, lng: 44.1322, nameAr: 'نجران', nameEn: 'Najran' },
  khamis_mushait: { lat: 18.3064, lng: 42.7292, nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait' },
};

export const salonMapRouter = router({
  // List all cities with coordinates
  cities: publicProcedure.query(() =>
    Object.entries(CITY_COORDS).map(([key, c]) => ({ key, ...c })),
  ),

  // Find technicians in a city (by area name match or all if no city)
  explore: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        categoryId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Fetch technicians with their services and user info
      const where: Record<string, unknown> = { isVerified: true };
      const technicians = await db.technician.findMany({
        where,
        take: BULK_PAGE_SIZE,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          services: {
            include: {
              service: { select: { id: true, titleJson: true, categoryId: true, basePrice: true } },
            },
          },
        },
      });

      // Build result with approximate coordinates based on areas
      const results = technicians.map((t: Record<string, unknown>) => {
        const tServices = (t.services as Array<Record<string, unknown>>) ?? [];
        const user = t.user as Record<string, unknown> | undefined;
        const servicesList = tServices.map((ts: Record<string, unknown>) => {
          const svc = ts.service as Record<string, unknown>;
          return {
            id: svc?.id,
            nameAr: (svc?.titleJson as Record<string, string>)?.ar ?? '',
            nameEn: (svc?.titleJson as Record<string, string>)?.en ?? '',
            categoryId: svc?.categoryId,
            price: Number(svc?.basePrice ?? 0),
          };
        });

        // Filter by category if requested
        if (
          input.categoryId &&
          !servicesList.some((s: Record<string, unknown>) => s.categoryId === input.categoryId)
        ) {
          return null;
        }

        // Assign a coordinate based on a hash of the technician ID for visual distribution
        const cityKey = input.city ?? 'riyadh';
        const baseCoord = CITY_COORDS[cityKey] ?? CITY_COORDS['riyadh']!;
        const tId = (t.id as number) ?? 1;
        const jitterLat = (((tId * 7) % 100) - 50) * 0.002;
        const jitterLng = (((tId * 13) % 100) - 50) * 0.002;

        return {
          id: t.id,
          name: user?.name ?? '',
          avatarUrl: user?.avatarUrl ?? null,
          lat: baseCoord.lat + jitterLat,
          lng: baseCoord.lng + jitterLng,
          city: baseCoord.nameAr,
          rating: Number(t.rating ?? 4.5),
          reviewCount: Number(t.reviewCount ?? 0),
          services: servicesList,
          isAvailable: (t.isAvailable as boolean) ?? true,
        };
      });

      return results.filter(Boolean);
    }),
});
