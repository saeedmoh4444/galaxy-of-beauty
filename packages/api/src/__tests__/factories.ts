/**
 * Test factories for creating isolated test data.
 *
 * Every factory returns a plain object suitable for Prisma create()
 * with randomized values to prevent cross-test contamination.
 *
 * Usage:
 *   const user = await prisma.user.create({ data: buildUser() });
 *   const booking = await prisma.booking.create({ data: buildBooking({ customerId: user.id }) });
 */
import crypto from 'crypto';

// ── Helpers ──────────────────────────────────────────────────

let _seq = 0;
function seq(): number {
  _seq++;
  return _seq;
}

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

function futureDate(daysAhead = 3): Date {
  return new Date(Date.now() + daysAhead * 86_400_000);
}

// ── User ─────────────────────────────────────────────────────

export interface BuildUserOverrides {
  email?: string;
  phone?: string;
  name?: string;
  role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  passwordHash?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  preferredLanguage?: 'ar' | 'en';
}

export function buildUser(overrides?: BuildUserOverrides) {
  const s = seq();
  return {
    email: overrides?.email ?? `test-${uid()}-${s}@example.com`,
    phone: overrides?.phone ?? `+9665${String(s).padStart(8, '0')}`,
    name: overrides?.name ?? `مستخدم تجريبي ${s}`,
    role: overrides?.role ?? 'CUSTOMER',
    passwordHash:
      overrides?.passwordHash ??
      '$2b$10$placeholderhashfortestingpurposesonly', // bcrypt hash for 'TestPass123!'
    isActive: overrides?.isActive ?? true,
    emailVerified: overrides?.emailVerified ?? true,
    twoFactorEnabled: overrides?.twoFactorEnabled ?? false,
    preferredLanguage: overrides?.preferredLanguage ?? 'ar',
  };
}

// ── Technician Profile ───────────────────────────────────────

export interface BuildTechnicianOverrides {
  userId: number;
  city?: string;
  bioJson?: { ar: string; en: string };
  isAvailable?: boolean;
  isVerified?: boolean;
}

export function buildTechnician(overrides: BuildTechnicianOverrides) {
  return {
    userId: overrides.userId,
    city: overrides.city ?? 'الرياض',
    bioJson: overrides.bioJson ?? { ar: 'خبيرة تجميل محترفة', en: 'Professional beautician' },
    isAvailable: overrides.isAvailable ?? true,
    isVerified: overrides.isVerified ?? true,
  };
}

// ── Category ─────────────────────────────────────────────────

export interface BuildCategoryOverrides {
  nameJson?: { ar: string; en: string };
  slug?: string;
  icon?: string;
}

export function buildCategory(overrides?: BuildCategoryOverrides) {
  const s = seq();
  return {
    nameJson: overrides?.nameJson ?? { ar: `تصنيف ${s}`, en: `Category ${s}` },
    slug: overrides?.slug ?? `category-${uid()}-${s}`,
    icon: overrides?.icon ?? '',
  };
}

// ── Service ──────────────────────────────────────────────────

export interface BuildServiceOverrides {
  categoryId: number;
  nameJson?: { ar: string; en: string };
  descriptionJson?: { ar: string; en: string };
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
  isWomenOnly?: boolean;
  homeServiceAvailable?: boolean;
}

export function buildService(overrides: BuildServiceOverrides) {
  const s = seq();
  return {
    categoryId: overrides.categoryId,
    nameJson: overrides.nameJson ?? { ar: `خدمة ${s}`, en: `Service ${s}` },
    descriptionJson: overrides.descriptionJson ?? { ar: 'وصف الخدمة', en: 'Service description' },
    price: overrides.price ?? 150.0,
    durationMinutes: overrides.durationMinutes ?? 60,
    isActive: overrides.isActive ?? true,
    isWomenOnly: overrides.isWomenOnly ?? true,
    homeServiceAvailable: overrides.homeServiceAvailable ?? false,
  };
}

// ── Booking ──────────────────────────────────────────────────

export interface BuildBookingOverrides {
  customerId: number;
  technicianId?: number;
  serviceId?: number;
  status?: string;
  totalAmount?: number;
  platformFee?: number;
  startAt?: Date;
  endAt?: Date;
  bookingCode?: string;
}

export function buildBooking(overrides: BuildBookingOverrides) {
  const s = seq();
  const startAt = overrides.startAt ?? futureDate(3);
  const endAt = overrides.endAt ?? new Date(startAt.getTime() + 3_600_000); // +1h
  return {
    customerId: overrides.customerId,
    technicianId: overrides.technicianId ?? overrides.customerId, // fallback
    serviceId: overrides.serviceId ?? 1,
    status: overrides.status ?? 'PENDING',
    totalAmount: overrides.totalAmount ?? 200.0,
    platformFee: overrides.platformFee ?? 11.0,
    startAt,
    endAt,
    bookingCode: overrides.bookingCode ?? `BK-${uid()}-${s}`,
  };
}

// ── Payment ──────────────────────────────────────────────────

export interface BuildPaymentOverrides {
  bookingId: number;
  userId: number;
  amount?: number;
  method?: string;
  status?: string;
  idempotencyKey?: string;
}

export function buildPayment(overrides: BuildPaymentOverrides) {
  const s = seq();
  return {
    bookingId: overrides.bookingId,
    userId: overrides.userId,
    amount: overrides.amount ?? 200.0,
    method: overrides.method ?? 'CARD',
    status: overrides.status ?? 'COMPLETED',
    idempotencyKey: overrides.idempotencyKey ?? `idem-${uid()}-${s}`,
  };
}

// ── Wallet ───────────────────────────────────────────────────

export interface BuildWalletOverrides {
  userId: number;
  balance?: number;
  currency?: string;
}

export function buildWallet(overrides: BuildWalletOverrides) {
  return {
    userId: overrides.userId,
    balance: overrides.balance ?? 0,
    currency: overrides.currency ?? 'SAR',
  };
}

// ── Review ───────────────────────────────────────────────────

export interface BuildReviewOverrides {
  bookingId: number;
  customerId: number;
  technicianId: number;
  rating?: number;
  comment?: string;
}

export function buildReview(overrides: BuildReviewOverrides) {
  return {
    bookingId: overrides.bookingId,
    customerId: overrides.customerId,
    technicianId: overrides.technicianId,
    rating: overrides.rating ?? 5,
    comment: overrides.comment ?? 'خدمة ممتازة',
  };
}
