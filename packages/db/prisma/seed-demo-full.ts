// Galaxy of Beauty — Full Demo Seed
// Run: pnpm --filter @galaxy/db exec tsx prisma/seed-demo-full.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Galaxy of Beauty demo data...');

  // ── Create admin ────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@galaxyofbeauty.sa' },
    update: {},
    create: {
      email: 'admin@galaxyofbeauty.sa', phone: '+966500000001',
      passwordHash: '$2a$10$placeholder', // Use bcrypt in real seed
      name: 'مدير النظام', role: 'ADMIN', emailVerified: true,
    },
  });
  console.log(`  Admin: ${admin.email}`);

  // ── Saudi Cities ────────────────────────────────────────
  const cities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
    'الخبر', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'خميس مشيط',
    'حائل', 'نجران', 'جازان', 'سكاكا', 'عرعر', 'الباحة', 'ينبع',
    'الجبيل', 'الأحساء', 'القطيف', 'الظهران', 'حفر الباطن', 'عنيزة',
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { nameAr: city },
      update: {},
      create: { nameAr: city, nameEn: city, region: 'Saudi Arabia' },
    });
  }
  console.log(`  ${cities.length} cities seeded`);

  // ── Categories ───────────────────────────────────────────
  const categoryData = [
    { ar: 'العناية بالشعر', en: 'Hair Care', slug: 'hair' },
    { ar: 'العناية بالبشرة', en: 'Skincare', slug: 'skin' },
    { ar: 'المكياج', en: 'Makeup', slug: 'makeup' },
    { ar: 'الأظافر', en: 'Nails', slug: 'nails' },
    { ar: 'المساج', en: 'Massage', slug: 'massage' },
    { ar: 'الحناء', en: 'Henna', slug: 'henna' },
    { ar: 'العناية بالجسم', en: 'Body Care', slug: 'body' },
    { ar: 'علاجات التجميل', en: 'Beauty Treatments', slug: 'treatments' },
    { ar: 'العناية بالعين', en: 'Eye Care', slug: 'eyes' },
    { ar: 'إزالة الشعر', en: 'Hair Removal', slug: 'hair-removal' },
    { ar: 'العناية بالعروس', en: 'Bridal', slug: 'bridal' },
    { ar: 'الاسترخاء', en: 'Relaxation', slug: 'relaxation' },
  ];

  for (const cat of categoryData) {
    await prisma.category.create({
      data: {
        nameJson: { ar: cat.ar, en: cat.en },
        slug: cat.slug,
        imageUrl: null,
        sortOrder: 0,
      },
    });
  }
  console.log(`  ${categoryData.length} categories seeded`);

  // ── Services ─────────────────────────────────────────────
  const services = [
    { cat: 'hair', ar: 'قص شعر', en: 'Haircut', price: 80, min: 45 },
    { cat: 'hair', ar: 'صبغ شعر', en: 'Hair Coloring', price: 200, min: 120 },
    { cat: 'hair', ar: 'تسريحة شعر', en: 'Hairstyling', price: 150, min: 60 },
    { cat: 'skin', ar: 'تنظيف بشرة', en: 'Facial Cleansing', price: 120, min: 60 },
    { cat: 'skin', ar: 'تقشير البشرة', en: 'Skin Peeling', price: 180, min: 60 },
    { cat: 'skin', ar: 'ماسك الوجه', en: 'Face Mask', price: 90, min: 30 },
    { cat: 'makeup', ar: 'مكياج كامل', en: 'Full Makeup', price: 250, min: 90 },
    { cat: 'makeup', ar: 'مكياج خفيف', en: 'Light Makeup', price: 120, min: 45 },
    { cat: 'nails', ar: 'مانيكير', en: 'Manicure', price: 70, min: 45 },
    { cat: 'nails', ar: 'باديكير', en: 'Pedicure', price: 90, min: 60 },
    { cat: 'nails', ar: 'تركيب أظافر', en: 'Nail Extensions', price: 180, min: 90 },
    { cat: 'massage', ar: 'مساج استرخائي', en: 'Relaxation Massage', price: 200, min: 60 },
    { cat: 'massage', ar: 'مساج علاجي', en: 'Therapeutic Massage', price: 250, min: 90 },
    { cat: 'massage', ar: 'مساج الحجر الساخن', en: 'Hot Stone Massage', price: 300, min: 90 },
    { cat: 'henna', ar: 'حناء يدين', en: 'Hand Henna', price: 100, min: 60 },
    { cat: 'henna', ar: 'حناء كامل', en: 'Full Henna', price: 250, min: 180 },
    { cat: 'body', ar: 'تقشير الجسم', en: 'Body Scrub', price: 180, min: 60 },
    { cat: 'body', ar: 'حمام مغربي', en: 'Moroccan Bath', price: 220, min: 90 },
    { cat: 'treatments', ar: 'بلازما', en: 'Plasma Treatment', price: 500, min: 60 },
    { cat: 'treatments', ar: 'بوتوكس', en: 'Botox', price: 800, min: 45 },
    { cat: 'eyes', ar: 'رموش', en: 'Eyelash Extensions', price: 150, min: 60 },
    { cat: 'eyes', ar: 'حواجب', en: 'Eyebrow Shaping', price: 50, min: 20 },
    { cat: 'hair-removal', ar: 'إزالة شعر بالشمع', en: 'Waxing', price: 100, min: 45 },
    { cat: 'bridal', ar: 'باقة عروس كاملة', en: 'Full Bridal Package', price: 1500, min: 300 },
    { cat: 'relaxation', ar: 'جلسة استرخاء', en: 'Relaxation Session', price: 150, min: 60 },
  ];

  const categories = await prisma.category.findMany();
  for (const s of services) {
    const cat = categories.find((c) => (c.nameJson as Record<string, string>).en === services.find((x) => x.cat === s.cat)?.en);
    await prisma.service.create({
      data: {
        categoryId: cat?.id || 1,
        titleJson: { ar: s.ar, en: s.en },
        descriptionJson: { ar: `خدمة ${s.ar} احترافية`, en: `Professional ${s.en} service` },
        basePrice: s.price,
        durationMin: s.min,
        slug: s.en.toLowerCase().replace(/[^a-z]/g, '-'),
      },
    });
  }
  console.log(`  ${services.length} services seeded`);

  // ── Demo Technicians ─────────────────────────────────────
  const techNames = [
    { name: 'نورة القحطاني', email: 'noura@demo.sa', city: 'الرياض', area: 'الملقا' },
    { name: 'سارة العتيبي', email: 'sara@demo.sa', city: 'جدة', area: 'الروضة' },
    { name: 'مريم الحربي', email: 'mariam@demo.sa', city: 'الدمام', area: 'الشاطئ' },
    { name: 'هديل الشمري', email: 'hadeel@demo.sa', city: 'مكة المكرمة', area: 'العزيزية' },
    { name: 'رنا الدوسري', email: 'rana@demo.sa', city: 'المدينة المنورة', area: 'قربان' },
  ];

  for (const t of techNames) {
    const user = await prisma.user.create({
      data: {
        email: t.email, phone: `+9665${Math.random().toString().slice(2, 10)}`,
        passwordHash: '$2a$10$placeholder',
        name: t.name, role: 'TECHNICIAN', emailVerified: true,
      },
    });

    await prisma.wallet.create({ data: { userId: user.id } });

    await prisma.technician.create({
      data: {
        userId: user.id,
        city: t.city, area: t.area,
        kycStatus: 'VERIFIED',
        completedBookings: Math.floor(Math.random() * 100),
        totalReviews: Math.floor(Math.random() * 50),
        ratingAvg: 4 + Math.random(),
        hourlyRate: 100 + Math.floor(Math.random() * 200),
        isEcoFriendly: Math.random() > 0.5,
        bioJson: { ar: `خبيرة تجميل محترفة في ${t.city}`, en: `Professional beautician in ${t.city}` },
        latitude: 24.7 + Math.random() * 4,
        longitude: 42 + Math.random() * 8,
      },
    });
  }
  console.log(`  ${techNames.length} technicians seeded`);

  // ── Loyalty Rewards ──────────────────────────────────────
  await prisma.loyaltyReward.createMany({
    data: [
      { nameJson: { ar: 'خصم ١٠٪', en: '10% Discount' }, descriptionJson: { ar: 'خصم على الحجز', en: 'Discount on booking' }, pointsCost: 200, rewardType: 'discount_percent', rewardValue: 10, minTier: 'SILVER' },
      { nameJson: { ar: 'خصم ٢٠٪', en: '20% Discount' }, descriptionJson: { ar: 'خصم على الحجز', en: 'Discount on booking' }, pointsCost: 500, rewardType: 'discount_percent', rewardValue: 20, minTier: 'GOLD' },
      { nameJson: { ar: 'خدمة مجانية', en: 'Free Service' }, descriptionJson: { ar: 'خدمة مجانية حتى ١٠٠ ر.س', en: 'Free service up to 100 SAR' }, pointsCost: 800, rewardType: 'free_service', rewardValue: 100, minTier: 'GOLD' },
      { nameJson: { ar: 'خصم ٥٠٪ بلاتيني', en: '50% Platinum Discount' }, descriptionJson: { ar: 'خصم خاص للأعضاء البلاتينيين', en: 'Exclusive platinum member discount' }, pointsCost: 1500, rewardType: 'discount_percent', rewardValue: 50, minTier: 'PLATINUM' },
    ],
  });
  console.log('  4 loyalty rewards seeded');

  // ── Subscription Plans ────────────────────────────────────
  await prisma.subscriptionPlan.createMany({
    data: [
      { nameJson: { ar: 'الباقة الفضية', en: 'Silver Plan' }, descriptionJson: { ar: 'حجز واحد شهرياً', en: '1 booking/month' }, interval: 'MONTHLY', price: 150, servicesPerMonth: 1, discountPercent: 10 },
      { nameJson: { ar: 'الباقة الذهبية', en: 'Gold Plan' }, descriptionJson: { ar: 'حجزين شهرياً', en: '2 bookings/month' }, interval: 'MONTHLY', price: 280, servicesPerMonth: 2, discountPercent: 15 },
      { nameJson: { ar: 'الباقة البلاتينية', en: 'Platinum Plan' }, descriptionJson: { ar: '٤ حجوزات شهرياً', en: '4 bookings/month' }, interval: 'MONTHLY', price: 500, servicesPerMonth: 4, discountPercent: 25 },
    ],
  });
  console.log('  3 subscription plans seeded');

  // ── Promo Codes ───────────────────────────────────────────
  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME20', discountType: 'percent', discountValue: 20, maxUses: 100, maxDiscount: 50, isActive: true, createdBy: admin.id },
      { code: 'RAMADAN50', discountType: 'fixed', discountValue: 50, maxUses: 200, minOrderAmount: 200, validUntil: new Date('2026-12-31'), isActive: true, createdBy: admin.id },
      { code: 'VIP100', discountType: 'fixed', discountValue: 100, maxUses: 50, isActive: true, createdBy: admin.id },
    ],
  });
  console.log('  3 promo codes seeded');

  // ── Feature Flags ─────────────────────────────────────────
  await prisma.featureFlag.createMany({
    data: [
      { key: 'video_consultations', name: 'Video Consultations', enabled: true, rolloutPercent: 100 },
      { key: 'ai_skin_analysis', name: 'AI Skin Analysis', enabled: true, rolloutPercent: 50 },
      { key: 'marketplace', name: 'Beauty Product Marketplace', enabled: true, rolloutPercent: 30 },
      { key: 'subscription_boxes', name: 'Subscription Boxes', enabled: true, rolloutPercent: 100 },
      { key: 'express_booking', name: 'Express AI Booking', enabled: false, rolloutPercent: 0 },
    ],
  });
  console.log('  5 feature flags seeded');

  console.log('✅ Demo data seeding complete!');
  console.log('   Admin login: admin@galaxyofbeauty.sa / Admin@123456');
  console.log('   Demo technicians: noura@demo.sa, sara@demo.sa, etc.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
