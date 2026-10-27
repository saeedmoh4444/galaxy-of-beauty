import crypto from 'crypto';
import { Prisma, prisma } from '@galaxy/db';

/**
 * C5 — hybrid store-services (H2): each store gets ONE hidden
 * pseudo-technician so the existing booking engine needs zero forks
 * (VENDOR_HYBRID_STORE_SERVICES_PLAN §3).
 *
 * The row's User is a generated non-login account (isActive: false —
 * auth rejects it) so no real identity is consumed, and the Technician
 * row carries storeVendorId so it can never surface in the technician
 * browse (its kycStatus also stays PENDING).
 *
 * City placeholder: Technician.city is NOT NULL but stores have no city —
 * 'RIYADH' is a documented placeholder; the booking flow resolves the
 * technician by id and never filters on city.
 */
export async function ensureStoreTechnician(vendorId: number): Promise<number> {
  const existing = await prisma.technician.findUnique({ where: { storeVendorId: vendorId } });
  if (existing) return existing.id;

  // Hidden user: generated unique email/phone + an unusable password hash.
  const suffix = String(vendorId).padStart(5, '0');
  try {
    const user = await prisma.user.create({
      data: {
        email: `store-tech-${suffix}@galaxyofbeauty.sa`,
        phone: `+9665000000${suffix}`,
        passwordHash: crypto.randomBytes(32).toString('hex'),
        name: 'Store Service Provider',
        isActive: false,
      },
    });

    const technician = await prisma.technician.create({
      data: {
        userId: user.id,
        storeVendorId: vendorId,
        city: 'RIYADH', // documented placeholder — stores have no city
        bioJson: { ar: '', en: '' },
      },
    });
    return technician.id;
  } catch (err) {
    // Concurrent first-service creation: the @unique race loser re-reads
    // the winner's row instead of failing the mutation.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const raced = await prisma.technician.findUnique({ where: { storeVendorId: vendorId } });
      if (raced) return raced.id;
    }
    throw err;
  }
}
