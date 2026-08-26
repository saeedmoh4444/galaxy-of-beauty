import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://gob_admin:gob_secure_pass_2024@localhost:5433/Galaxy_of_Beauty_db',
});
const db = prisma;
async function main() {
  try {
    const r = await db.service.findMany({
      where: { isActive: true, isPopular: true },
      take: 6,
      select: { id: true, titleJson: true, basePrice: true, imageUrl: true, emoji: true },
    });
    console.log(
      'FEATURED OK count=' + r.length + ' first=' + JSON.stringify(r[0] ?? null).slice(0, 250),
    );
  } catch (e) {
    console.log('FEATURED ERR ' + String(e.message).slice(0, 400));
  }
  try {
    const ev = await db.beautyEvent.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      take: 4,
      select: { id: true, nameJson: true, eventType: true, startsAt: true, location: true },
    });
    console.log('EVENTS OK count=' + ev.length);
  } catch (e) {
    console.log('EVENTS ERR ' + String(e.message).slice(0, 300));
  }
  try {
    const f = await db.flashDeal.findMany({
      where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
      take: 4,
      select: {
        id: true,
        titleAr: true,
        dealPrice: true,
        originalPrice: true,
        discountPercent: true,
        serviceId: true,
      },
    });
    console.log('FLASH OK count=' + f.length);
  } catch (e) {
    console.log('FLASH ERR ' + String(e.message).slice(0, 300));
  }
  await prisma.$disconnect();
}
main();
