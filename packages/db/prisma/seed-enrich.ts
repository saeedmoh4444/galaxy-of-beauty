/**
 * Galaxy of Beauty — Seed Data Enrichment
 *
 * Generates realistic production-scale data on top of the base seed.
 * Run AFTER `pnpm db:seed`:
 *   pnpm --filter @galaxy/db exec npx tsx prisma/seed-enrich.ts
 *
 * Targets:
 *   Customers:    6 → 30   (24 new)
 *   Technicians:  3 → 12   (9 new, 3 per city)
 *   Bookings:     6 → 500  (494 new, 30-day span)
 *   Reviews:      2 → 100  (98 new, Arabic, varied ratings)
 *   Wallet Txns:  2 → 80   (78 new)
 *   Loyalty:      1 → 20   (19 new accounts)
 *   Notifications: 2 → 50  (48 new)
 *   Promo Usages: 0 → 40
 *   Gift Card Txns: 0 → 10
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const db = prisma as any;

function generateBookingCode(): string {
  return `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(daysAgo: number, hour?: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysAgo));
  if (hour !== undefined) {
    d.setHours(hour, randomInt(0, 59), 0, 0);
  } else {
    d.setHours(randomInt(9, 20), randomInt(0, 59), 0, 0);
  }
  return d;
}

const PASSWORD_HASH = '$2b$12$WLl1knNaSSoIuae5Pjcd9.5IlMOPSEb8w5dd/22Kyxmkw5Sei2Wvi'; // Admin@123456

const CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'الخبر',
  'المدينة المنورة',
  'الطائف',
  'أبها',
  'تبوك',
  'بريدة',
  'حائل',
];

const CUSTOMER_NAMES = [
  'نورة العمري',
  'سارة الحربي',
  'مها القحطاني',
  'ريم المطيري',
  'هند الشمري',
  'لطيفة العتيبي',
  'عبير الزهراني',
  'منال الغامدي',
  'دلال السبيعي',
  'نوف الرشيد',
  'أمل الخالدي',
  'غادة الدوسري',
  'شهد السالم',
  'رغد العنزي',
  'جواهر المالكي',
  'بسمة الفيصل',
  'أروى الشهري',
  'دانه الجهني',
  'هيا البلوي',
  'نورة السديري',
  'ملاك العسيري',
  'لين القحطاني',
  'سلمى المطيري',
  'ديما الشمري',
  'نوف العتيبي',
  'رزان الحربي',
  'أسيل الزهراني',
  'جود الغامدي',
  'تالا السبيعي',
  'لمى الرشيد',
];

const TECH_NAMES = [
  { name: 'نورة العمري', speciality: 'makeup' },
  { name: 'سارة الحربي', speciality: 'hair' },
  { name: 'د. ليلى القحطاني', speciality: 'skincare' },
  { name: 'هند الشريف', speciality: 'nails' },
  { name: 'عبير الغامدي', speciality: 'henna' },
  { name: 'منال السالم', speciality: 'massage' },
  { name: 'دلال الجهني', speciality: 'makeup' },
  { name: 'نوف العنزي', speciality: 'hair' },
  { name: 'أمل الرشيد', speciality: 'skincare' },
  { name: 'غادة الزهراني', speciality: 'nails' },
  { name: 'شهد المالكي', speciality: 'massage' },
  { name: 'رغد الدوسري', speciality: 'henna' },
];

const REVIEW_COMMENTS_AR = [
  'خدمة ممتازة وأنيقة! أنصح بها بشدة 🌟',
  'رائعة جداً، سأكرر التجربة بالتأكيد',
  'محترفة ونظيفة، شكراً جزيلاً',
  'أفضل فنية جربتها في الرياض',
  'مبدعة ومتقنة لعملها، ما شاء الله',
  'الخدمة كانت جيدة جداً، الأسعار مناسبة',
  'تعامل راقي ونتيجة مرضية الحمدلله',
  'جودة عالية ومنتجات أصلية، شكراً',
  'سريعة ومنظمة، ما أخذت وقت زيادة',
  'شرحت لي كل خطوة قبل ما تبدأ، مريحة جداً',
  'النتيجة أفضل مما توقعت، فرحت كثير',
  'أنيقة وذوقها رفيع في اختيار الألوان',
  'خدمة تستاهل كل ريال، بكرر الزيارة',
  'أول مرة أجرب وأكيد مو آخر مرة',
  'حبيت اهتمامها بأدق التفاصيل',
];

async function main() {
  console.log('🌱 Enriching Galaxy of Beauty database...\n');

  // ── Get existing data ──
  const existingUsers = await db.user.findMany({ include: { wallet: true } });
  const existingCustomers = existingUsers.filter((u: any) => u.role === 'CUSTOMER');
  const existingTechs = await db.technician.findMany({ include: { user: true } });
  const allServices = await db.service.findMany({ include: { variants: true } });
  const allCategories = await db.category.findMany();

  console.log(
    `   Found: ${existingCustomers.length} customers, ${existingTechs.length} techs, ${allServices.length} services`,
  );

  // ═══════════════════════════════════════════════════════════════
  // 1. ADD 24 MORE CUSTOMERS
  // ═══════════════════════════════════════════════════════════════
  const remainingNames = CUSTOMER_NAMES.filter(
    (n) => !existingCustomers.some((c: any) => c.name === n),
  );
  const newCustomerIds: number[] = [];

  for (let i = 0; i < 24 && i < remainingNames.length; i++) {
    const name = remainingNames[i]!;
    const city = pick(CITIES);
    const email = `customer_enrich_${i + 1}@test.com`;
    const u = await db.user.create({
      data: {
        email,
        phone: `+9665${randomInt(10000000, 99999999)}`,
        passwordHash: PASSWORD_HASH,
        name,
        role: 'CUSTOMER',
        emailVerified: true,
        phoneVerified: Math.random() > 0.3,
        preferredLanguage: pick(['ar', 'ar', 'ar', 'en']), // 75% Arabic
        createdAt: randomDate(180),
      },
    });
    await db.wallet.create({
      data: { userId: u.id, balance: randomInt(0, 1000), bonusBalance: randomInt(0, 200) },
    });
    existingCustomers.push(u);
    newCustomerIds.push(u.id);
  }
  console.log(`✅ ${newCustomerIds.length} new customers (total: ${existingCustomers.length})`);

  // ═══════════════════════════════════════════════════════════════
  // 1b. CREATE ADDRESSES for all customers (required for bookings)
  // ═══════════════════════════════════════════════════════════════
  const AREAS = [
    'الملز',
    'الروضة',
    'النسيم',
    'الشفا',
    'العليا',
    'الحمراء',
    'البحر',
    'النخيل',
    'الورود',
    'المروج',
  ];
  const STREETS = [
    'شارع التحلية',
    'طريق الملك فهد',
    'شارع الأمير سلطان',
    'طريق الملك عبدالله',
    'شارع التخصصي',
    'شارع العليا العام',
  ];

  for (const cust of existingCustomers) {
    const hasAddress = await db.address.findFirst({ where: { userId: cust.id } });
    if (hasAddress) continue;
    try {
      await db.address.create({
        data: {
          userId: cust.id,
          label: pick(['المنزل', 'العمل', 'بيت العائلة']),
          city: pick(CITIES),
          area: pick(AREAS),
          street: pick(STREETS),
          building: `${randomInt(1, 50)}`,
          floor: `${randomInt(1, 10)}`,
          apartment: `${randomInt(1, 20)}`,
          lat: 24.7 + Math.random() * 2,
          lng: 46.6 + Math.random() * 2,
          isDefault: true,
        },
      });
    } catch {
      /* skip */
    }
  }
  const addressCount = await db.address.count();
  console.log(`✅ Addresses created (total: ${addressCount})`);

  // ═══════════════════════════════════════════════════════════════
  // 2. ADD 9 MORE TECHNICIANS (target: 12 total, 3 per city)
  // ═══════════════════════════════════════════════════════════════
  const remainingTechs = TECH_NAMES.filter(
    (t) => !existingTechs.some((et: any) => et.user.name === t.name),
  );
  const newTechRecords: any[] = [];

  for (let i = 0; i < 9 && i < remainingTechs.length; i++) {
    const td = remainingTechs[i]!;
    const city = CITIES[i % CITIES.length]!;
    const area = pick(['الملز', 'الروضة', 'النسيم', 'الشفا', 'العليا', 'الحمراء', 'البحر']);
    const u = await db.user.create({
      data: {
        email: `tech_enrich_${i + 1}@test.com`,
        phone: `+9665${randomInt(10000000, 99999999)}`,
        passwordHash: PASSWORD_HASH,
        name: td.name,
        role: 'TECHNICIAN',
        emailVerified: true,
        phoneVerified: true,
        preferredLanguage: 'ar',
        createdAt: randomDate(365),
      },
    });
    await db.wallet.create({ data: { userId: u.id, balance: 0, bonusBalance: 0 } });

    const tech = await db.technician.create({
      data: {
        userId: u.id,
        city,
        area,
        ratingAvg: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        completedBookings: randomInt(5, 200),
        kycStatus: Math.random() > 0.2 ? 'VERIFIED' : 'SUBMITTED',
        hourlyRate: randomInt(50, 200),
        bioJson: {
          ar: `خبيرة ${td.speciality} مع ${randomInt(2, 10)} سنوات خبرة`,
          en: `${td.speciality} expert`,
        },
        bufferMinutes: 15,
        isEcoFriendly: Math.random() > 0.6,
      },
    });

    // Assign 2-4 services per technician
    const numServices = randomInt(2, 5);
    const shuffled = [...allServices].sort(() => Math.random() - 0.5);
    for (let s = 0; s < numServices; s++) {
      try {
        await db.technicianService.create({
          data: {
            technicianId: tech.id,
            serviceId: shuffled[s]!.id,
            customPrice: Math.random() > 0.5 ? randomInt(50, 600) : 0,
            isActive: true,
          },
        });
      } catch {
        /* duplicate, skip */
      }
    }
    newTechRecords.push({ ...tech, user: u });
  }
  const allTechs = [...existingTechs.map((t: any) => ({ ...t, user: t.user })), ...newTechRecords];
  console.log(`✅ ${newTechRecords.length} new technicians (total: ${allTechs.length})`);

  // ═══════════════════════════════════════════════════════════════
  // 3. GENERATE SLOTS for new techs (next 14 days)
  // ═══════════════════════════════════════════════════════════════
  let newSlotCount = 0;
  for (const tech of newTechRecords) {
    for (let day = 0; day < 14; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      // Skip Fridays partially (shorter hours)
      const isFriday = date.getDay() === 5; // Friday in JS
      const startHour = isFriday ? 14 : 9;
      const endHour = isFriday ? 20 : 21;

      for (let h = startHour; h < endHour; h++) {
        if (Math.random() > 0.85) continue; // 15% random gaps
        const start = new Date(date);
        start.setHours(h, 0, 0, 0);
        const end = new Date(start.getTime() + 60 * 60000);
        try {
          await db.availabilitySlot.create({
            data: {
              technicianId: tech.id,
              startAt: start,
              endAt: end,
              isAvailable: true,
              isBooked: false,
            },
          });
          newSlotCount++;
        } catch {
          /* skip collisions */
        }
      }
    }
  }
  console.log(`✅ ${newSlotCount} new availability slots`);

  // ═══════════════════════════════════════════════════════════════
  // 4. GENERATE 500 BOOKINGS (realistic patterns)
  // ═══════════════════════════════════════════════════════════════
  const BOOKING_DISTRIBUTION = [
    { status: 'COMPLETED', count: 300, daysAgo: 30 },
    { status: 'CANCELLED', count: 80, daysAgo: 30 },
    { status: 'REJECTED', count: 30, daysAgo: 30 },
    { status: 'NO_SHOW', count: 20, daysAgo: 30 },
    { status: 'REQUESTED', count: 40, daysAgo: 3 },
    { status: 'ACCEPTED', count: 30, daysAgo: 7 },
  ];

  // Saudi weekend: Thursday(4), Friday(5), Saturday(6)
  const PEAK_DAYS = [4, 5, 6];
  const PEAK_HOURS = [16, 17, 18, 19, 20];

  let newBookingCount = 0;
  const bookingIds: number[] = [];

  for (const bucket of BOOKING_DISTRIBUTION) {
    for (let i = 0; i < bucket.count; i++) {
      try {
        const customer = pick(existingCustomers);
        const tech = pick(allTechs);
        const service = pick(allServices);
        const variant =
          service.variants?.length > 0 && Math.random() > 0.6 ? pick(service.variants) : null;

        // Date/time with peak-hour bias
        let daysAgo = randomInt(0, bucket.daysAgo);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        // 60% chance of peak day, 40% any day
        if (Math.random() > 0.4) {
          const peakDay = pick(PEAK_DAYS);
          // Adjust to nearest peak day
          while (date.getDay() !== peakDay) {
            date.setDate(date.getDate() - 1);
          }
        }

        // 65% chance of peak hour (16-20), else any hour 9-21
        const hour = Math.random() < 0.65 ? pick(PEAK_HOURS) : randomInt(9, 21);
        date.setHours(hour, randomInt(0, 3) * 15, 0, 0);

        const durationMin = service.durationMin + (variant?.durationDelta ?? 0);
        const endAt = new Date(date.getTime() + durationMin * 60000);

        const basePrice = Number(service.basePrice);
        const priceDelta = variant ? Number(variant.priceDelta) : 0;
        const totalAmount = basePrice + priceDelta;

        const booking = await db.booking.create({
          data: {
            bookingCode: generateBookingCode(),
            customerId: customer.id,
            technicianId: tech.user.id,
            serviceId: service.id,
            variantId: variant?.id ?? null,
            addressId: (await db.address.findFirst({ where: { userId: customer.id } }))?.id ?? null,
            startAt: date,
            endAt,
            status: bucket.status,
            totalAmount,
            platformFee: 11,
            paymentFee: Math.round(totalAmount * 0.029 * 100) / 100,
            notes: Math.random() > 0.7 ? 'يرجى استخدام منتجات عضوية' : null,
            createdAt: new Date(date.getTime() - randomInt(1, 7) * 86400000),
          },
        });
        bookingIds.push(booking.id);
        newBookingCount++;
      } catch (err: any) {
        // Skip individual booking errors (missing address, etc.)
        if (i < 5) console.log(`   ⚠️ Booking skipped: ${err.message?.slice(0, 60)}`);
      }
    }
  }
  console.log(`✅ ${newBookingCount} bookings (target: 500, across 30 days)`);

  // ═══════════════════════════════════════════════════════════════
  // 5. GENERATE 100 REVIEWS
  // ═══════════════════════════════════════════════════════════════
  const completedBookings = await db.booking.findMany({
    where: { status: 'COMPLETED' },
    take: 100,
  });

  let reviewCount = 0;
  for (const booking of completedBookings) {
    if (reviewCount >= 100) break;
    try {
      await db.review.create({
        data: {
          bookingId: booking.id,
          customerId: booking.customerId,
          rating: randomInt(3, 5), // Mostly positive
          comment: pick(REVIEW_COMMENTS_AR),
          isVisible: Math.random() > 0.05, // 95% visible
          createdAt: new Date(booking.createdAt.getTime() + randomInt(1, 72) * 3600000),
        },
      });
      reviewCount++;
    } catch {
      /* duplicate booking review, skip */
    }
  }
  console.log(`✅ ${reviewCount} reviews`);

  // ═══════════════════════════════════════════════════════════════
  // 6. GENERATE 80 WALLET TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════
  const allWallets = await db.wallet.findMany();
  let walletTxCount = 0;

  const txTemplates = [
    { type: 'CREDIT', source: 'CASHBACK', min: 5, max: 50, desc: 'كاش باك من الحجز' },
    { type: 'CREDIT', source: 'REFERRAL_BONUS', min: 20, max: 100, desc: 'مكافأة إحالة' },
    { type: 'CREDIT', source: 'SUBSCRIPTION_BONUS', min: 10, max: 30, desc: 'مكافأة اشتراك' },
    { type: 'DEBIT', source: 'WITHDRAWAL', min: 100, max: 500, desc: 'سحب للمحفظة البنكية' },
    { type: 'DEBIT', source: 'REFUND', min: 50, max: 300, desc: 'استرداد مبلغ' },
    { type: 'CREDIT', source: 'PLATFORM_FEE_SHARE', min: 10, max: 60, desc: 'عائد المنصة' },
  ];

  for (let i = 0; i < 80; i++) {
    try {
      const wallet = pick(allWallets);
      const tmpl = pick(txTemplates);
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: tmpl.type,
          source: tmpl.source,
          amount: randomInt(tmpl.min, tmpl.max),
          description: tmpl.desc,
          referenceId: `enrich_${i}_${randomInt(1000, 9999)}`,
          idempotencyKey: `enrich_wtx_${i}_${crypto.randomUUID()}`,
          createdAt: randomDate(60),
        },
      });
      walletTxCount++;
    } catch (err: any) {
      if (i < 3) console.log(`   ⚠️ Wallet tx skipped: ${err.message?.slice(0, 60)}`);
    }
  }
  console.log(`✅ ${walletTxCount} wallet transactions`);

  // ═══════════════════════════════════════════════════════════════
  // 7. LOYALTY ACCOUNTS for all customers (1→20)
  // ═══════════════════════════════════════════════════════════════
  const TIERS = ['SILVER', 'SILVER', 'SILVER', 'GOLD', 'GOLD', 'PLATINUM']; // Weighted
  let loyaltyCount = 0;

  for (const cust of existingCustomers) {
    try {
      const existing = await db.loyaltyAccount.findUnique({ where: { userId: cust.id } });
      if (existing) continue;

      const tier = pick(TIERS);
      const lifetimePoints =
        tier === 'PLATINUM'
          ? randomInt(2000, 5000)
          : tier === 'GOLD'
            ? randomInt(500, 1999)
            : randomInt(0, 499);

      await db.loyaltyAccount.create({
        data: {
          userId: cust.id,
          points: randomInt(0, lifetimePoints),
          lifetimePoints,
          tier,
        },
      });
      loyaltyCount++;
    } catch {
      /* already exists */
    }
  }
  console.log(`✅ ${loyaltyCount} loyalty accounts (total now ~${loyaltyCount + 1})`);

  // ═══════════════════════════════════════════════════════════════
  // 8. GENERATE 50 NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  const notifTemplates = [
    { type: 'booking_accepted', titleAr: 'تم قبول حجزك', bodyAr: 'تم قبول حجزك من قبل {tech}' },
    { type: 'booking_reminder', titleAr: 'تذكير بحجزك', bodyAr: 'لديك حجز غداً الساعة {time}' },
    { type: 'promo', titleAr: 'عرض خاص لكِ', bodyAr: 'خصم {pct}٪ على جميع الخدمات' },
    { type: 'cashback', titleAr: 'تم إضافة كاش باك', bodyAr: 'تم إضافة {amount} ر.س إلى محفظتك' },
    { type: 'streak', titleAr: 'استمرارية رائعة', bodyAr: 'أنتِ على وشك تحقيق إنجاز جديد' },
  ];

  let notifCount = 0;
  for (let i = 0; i < 50; i++) {
    try {
      const customer = pick(existingCustomers);
      const tmpl = pick(notifTemplates);
      await db.notification.create({
        data: {
          userId: customer.id,
          type: tmpl.type,
          titleJson: { ar: tmpl.titleAr, en: tmpl.titleAr },
          bodyJson: {
            ar: tmpl.bodyAr
              .replace('{tech}', pick(TECH_NAMES).name)
              .replace('{time}', `${randomInt(9, 21)}:00`)
              .replace('{pct}', `${randomInt(10, 50)}`)
              .replace('{amount}', `${randomInt(10, 100)}`),
            en: '',
          },
          isRead: Math.random() > 0.4,
          readAt: Math.random() > 0.4 ? randomDate(7) : null,
          sentVia: pick([['in_app'], ['email', 'in_app'], ['push', 'in_app']]),
          createdAt: randomDate(30),
        },
      });
      notifCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${notifCount} notifications`);

  // ═══════════════════════════════════════════════════════════════
  // 9. GENERATE 40 PROMO CODE USAGES
  // ═══════════════════════════════════════════════════════════════
  const promoCodes = await db.promoCode.findMany({ where: { isActive: true } });
  let promoUsageCount = 0;

  for (let i = 0; i < 40; i++) {
    try {
      const promo = pick(promoCodes);
      const customer = pick(existingCustomers);
      const bookingId = bookingIds.length > 0 ? pick(bookingIds) : null;
      await db.promoUsage.create({
        data: {
          promoCodeId: promo.id,
          userId: customer.id,
          bookingId,
          discountAmount: randomInt(10, 100),
          createdAt: randomDate(60),
        },
      });
      promoUsageCount++;
    } catch {
      /* duplicate, skip */
    }
  }
  console.log(`✅ ${promoUsageCount} promo code usages`);

  // ═══════════════════════════════════════════════════════════════
  // 10. GENERATE 10 GIFT CARD TRANSACTIONS
  // ═══════════════════════════════════════════════════════════════
  const giftCards = await db.giftCard.findMany({ where: { status: 'ACTIVE' } });
  let giftCardTxCount = 0;

  for (let i = 0; i < 10; i++) {
    try {
      const gc = giftCards.length > 0 ? pick(giftCards) : null;
      if (!gc) continue;
      const bookingId = bookingIds.length > 0 ? pick(bookingIds) : null;
      await db.giftCardTransaction.create({
        data: {
          giftCardId: gc.id,
          bookingId,
          amount: randomInt(20, 200),
          createdAt: randomDate(60),
        },
      });
      giftCardTxCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${giftCardTxCount} gift card transactions`);

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════

  const finalCustomers = await db.user.count({ where: { role: 'CUSTOMER' } });
  const finalTechs = await db.technician.count();
  const finalBookings = await db.booking.count();
  const finalReviews = await db.review.count();
  const finalWalletTxs = await db.walletTransaction.count();
  const finalLoyalty = await db.loyaltyAccount.count();
  const finalNotifs = await db.notification.count();
  const finalPromoUsages = await db.promoUsage.count();
  const finalGiftCardTxs = await db.giftCardTransaction.count();

  console.log('\n📊 FINAL COUNTS:');
  console.log(`   Customers:      ${finalCustomers}`);
  console.log(`   Technicians:    ${finalTechs}`);
  console.log(`   Bookings:       ${finalBookings}`);
  console.log(`   Reviews:        ${finalReviews}`);
  console.log(`   Wallet Txns:    ${finalWalletTxs}`);
  console.log(`   Loyalty Accts:  ${finalLoyalty}`);
  console.log(`   Notifications:  ${finalNotifs}`);
  console.log(`   Promo Usages:   ${finalPromoUsages}`);
  console.log(`   Gift Card Txns: ${finalGiftCardTxs}`);
  console.log('\n🎉 Seed enrichment complete!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Enrichment failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
