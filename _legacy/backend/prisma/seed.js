/**
 * Database seed script for Galaxy of Beauty.
 * Populates initial categories, services, and admin user.
 *
 * Usage: node prisma/seed.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Galaxy of Beauty database...\n');

  // ---- Create Admin User ----
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@galaxyofbeauty.sa' },
    update: {},
    create: {
      email: 'admin@galaxyofbeauty.sa',
      phone: '+966500000001',
      name: 'System Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ---- Create Categories ----
  const categories = [
    {
      slug: 'hair-care',
      nameJson: { ar: 'العناية بالشعر', en: 'Hair Care' },
      iconUrl: '/icons/hair.svg',
      sortOrder: 1,
      children: [
        { slug: 'haircut', nameJson: { ar: 'قص شعر', en: 'Haircut' }, sortOrder: 1 },
        { slug: 'hair-color', nameJson: { ar: 'صبغ شعر', en: 'Hair Color' }, sortOrder: 2 },
        { slug: 'hair-styling', nameJson: { ar: 'تسريحات', en: 'Hair Styling' }, sortOrder: 3 },
        { slug: 'hair-treatment', nameJson: { ar: 'علاجات الشعر', en: 'Hair Treatment' }, sortOrder: 4 },
      ],
    },
    {
      slug: 'nail-care',
      nameJson: { ar: 'العناية بالأظافر', en: 'Nail Care' },
      iconUrl: '/icons/nails.svg',
      sortOrder: 2,
      children: [
        { slug: 'manicure', nameJson: { ar: 'مانيكير', en: 'Manicure' }, sortOrder: 1 },
        { slug: 'pedicure', nameJson: { ar: 'بديكير', en: 'Pedicure' }, sortOrder: 2 },
        { slug: 'nail-art', nameJson: { ar: 'فن الأظافر', en: 'Nail Art' }, sortOrder: 3 },
      ],
    },
    {
      slug: 'skin-care',
      nameJson: { ar: 'العناية بالبشرة', en: 'Skin Care' },
      iconUrl: '/icons/skin.svg',
      sortOrder: 3,
      children: [
        { slug: 'facial', nameJson: { ar: 'تنظيف البشرة', en: 'Facial' }, sortOrder: 1 },
        { slug: 'peeling', nameJson: { ar: 'تقشير', en: 'Peeling' }, sortOrder: 2 },
        { slug: 'mask', nameJson: { ar: 'ماسك', en: 'Face Mask' }, sortOrder: 3 },
      ],
    },
    {
      slug: 'makeup',
      nameJson: { ar: 'مكياج', en: 'Makeup' },
      iconUrl: '/icons/makeup.svg',
      sortOrder: 4,
      children: [
        { slug: 'bridal-makeup', nameJson: { ar: 'مكياج عرايس', en: 'Bridal Makeup' }, sortOrder: 1 },
        { slug: 'evening-makeup', nameJson: { ar: 'مكياج سهرات', en: 'Evening Makeup' }, sortOrder: 2 },
        { slug: 'everyday-makeup', nameJson: { ar: 'مكياج يومي', en: 'Everyday Makeup' }, sortOrder: 3 },
      ],
    },
    {
      slug: 'body-care',
      nameJson: { ar: 'العناية بالجسم', en: 'Body Care' },
      iconUrl: '/icons/body.svg',
      sortOrder: 5,
      children: [
        { slug: 'massage', nameJson: { ar: 'مساج', en: 'Massage' }, sortOrder: 1 },
        { slug: 'waxing', nameJson: { ar: 'إزالة الشعر', en: 'Waxing' }, sortOrder: 2 },
        { slug: 'body-scrub', nameJson: { ar: 'تقشير الجسم', en: 'Body Scrub' }, sortOrder: 3 },
      ],
    },
    {
      slug: 'henna',
      nameJson: { ar: 'حناء', en: 'Henna' },
      iconUrl: '/icons/henna.svg',
      sortOrder: 6,
      children: [
        { slug: 'hand-henna', nameJson: { ar: 'حناء يدين', en: 'Hand Henna' }, sortOrder: 1 },
        { slug: 'foot-henna', nameJson: { ar: 'حناء قدمين', en: 'Foot Henna' }, sortOrder: 2 },
      ],
    },
  ];

  for (const cat of categories) {
    const { children, ...parentData } = cat;
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {},
      create: parentData,
    });

    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: { ...child, parentId: parent.id },
      });
    }
  }
  console.log('✅ Categories created');

  // ---- Create Sample Services ----
  const services = [
    // Hair Care
    {
      categorySlug: 'haircut',
      titleJson: { ar: 'قص شعر قصير', en: 'Short Haircut' },
      descriptionJson: { ar: 'قصة شعر عصرية تناسب شكل وجهك', en: 'Modern haircut suited to your face shape' },
      basePrice: 80, durationMin: 45, isPopular: true,
    },
    {
      categorySlug: 'haircut',
      titleJson: { ar: 'قص شعر طويل', en: 'Long Haircut' },
      descriptionJson: { ar: 'قص وتصفيف الشعر الطويل', en: 'Long hair cut and styling' },
      basePrice: 120, durationMin: 60, isPopular: true,
    },
    {
      categorySlug: 'hair-color',
      titleJson: { ar: 'صبغ شعر كامل', en: 'Full Hair Color' },
      descriptionJson: { ar: 'صبغ كامل للشعر بألوان عصرية', en: 'Full hair coloring with modern shades' },
      basePrice: 200, durationMin: 120,
    },
    // Nail Care
    {
      categorySlug: 'manicure',
      titleJson: { ar: 'مانيكير أساسي', en: 'Basic Manicure' },
      descriptionJson: { ar: 'تقليم وتنظيف وترطيب الأظافر', en: 'Nail trimming, cleaning, and moisturizing' },
      basePrice: 60, durationMin: 45, isPopular: true,
    },
    {
      categorySlug: 'pedicure',
      titleJson: { ar: 'بديكير فاخر', en: 'Deluxe Pedicure' },
      descriptionJson: { ar: 'عناية كاملة بالقدمين مع تدليك', en: 'Complete foot care with massage' },
      basePrice: 100, durationMin: 60,
    },
    // Skin Care
    {
      categorySlug: 'facial',
      titleJson: { ar: 'تنظيف بشرة عميق', en: 'Deep Facial Cleansing' },
      descriptionJson: { ar: 'تنظيف عميق للبشرة مع تقشير وترطيب', en: 'Deep skin cleansing with exfoliation and moisturizing' },
      basePrice: 150, durationMin: 75, isPopular: true,
    },
    // Makeup
    {
      categorySlug: 'bridal-makeup',
      titleJson: { ar: 'مكياج عرايس كامل', en: 'Full Bridal Makeup' },
      descriptionJson: { ar: 'مكياج كامل للعروس مع تجربة قبل الزفاف', en: 'Complete bridal makeup with trial session' },
      basePrice: 800, durationMin: 180, isPopular: true,
    },
    {
      categorySlug: 'evening-makeup',
      titleJson: { ar: 'مكياج سهرات', en: 'Evening Makeup' },
      descriptionJson: { ar: 'مكياج احترافي للسهرات والمناسبات', en: 'Professional evening and event makeup' },
      basePrice: 250, durationMin: 90,
    },
    // Massage
    {
      categorySlug: 'massage',
      titleJson: { ar: 'مساج استرخائي', en: 'Relaxation Massage' },
      descriptionJson: { ar: 'مساج لكامل الجسم للاسترخاء', en: 'Full body relaxation massage' },
      basePrice: 200, durationMin: 60, isPopular: true,
    },
    // Henna
    {
      categorySlug: 'hand-henna',
      titleJson: { ar: 'حناء يدين', en: 'Hand Henna' },
      descriptionJson: { ar: 'نقش حناء احترافي لليدين', en: 'Professional hand henna design' },
      basePrice: 100, durationMin: 60,
    },
  ];

  for (const svc of services) {
    const { categorySlug, ...data } = svc;
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (category) {
      // Check if service already exists to make seeding idempotent
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, titleJson: { equals: data.titleJson } },
      });
      if (!existing) {
        await prisma.service.create({
          data: { ...data, categoryId: category.id },
        });
      }
    }
  }
  console.log('✅ Services created (idempotent)');

  // ---- AI Subscription Plans ----
  const existingPlans = await prisma.aiSubscriptionPlan.count();
  if (existingPlans === 0) {
    const aiPlans = [
      {
        nameJson: { ar: 'الباقة الأساسية - المساعد ليلى', en: 'Basic Plan - Layla Assistant' },
        feature: 'CHATBOT',
        monthlyLimit: 100,
        priceMonthly: 0,
        isActive: true,
      },
      {
        nameJson: { ar: 'الباقة المتقدمة - توصيات ذكية', en: 'Advanced Plan - Smart Recommendations' },
        feature: 'RECOMMENDATIONS',
        monthlyLimit: 500,
        priceMonthly: 29.99,
        isActive: true,
      },
      {
        nameJson: { ar: 'الباقة الشاملة - ليلى + التوصيات', en: 'Complete Plan - Layla + Recommendations' },
        feature: 'CHATBOT',
        monthlyLimit: 500,
        priceMonthly: 49.99,
        isActive: true,
      },
    ];

    for (const plan of aiPlans) {
      await prisma.aiSubscriptionPlan.create({ data: plan });
    }
    console.log('✅ AI subscription plans seeded');
  } else {
    console.log('ℹ️ AI subscription plans already exist — skipping');
  }

  // ---- Platform Default Config ----
  const configs = [
    { key: 'platform_fee_sar', value: '11.00', description: 'Fixed platform fee per booking in SAR' },
    { key: 'cashback_first_booking_percent', value: '40', description: 'Cashback percentage on first booking' },
    { key: 'cashback_subsequent_percent', value: '5', description: 'Cashback percentage on subsequent bookings' },
    { key: 'wallet_usage_max_percent', value: '10', description: 'Max wallet usage as % of service price' },
    { key: 'technician_earnings_percent', value: '99', description: 'Technician earnings as % of service price' },
    { key: 'technician_wallet_share_percent', value: '1', description: 'Technician wallet credit as % of service' },
    { key: 'technician_platform_fee_share_percent', value: '25', description: 'Technician share of platform fee' },
    { key: 'min_withdrawal_balance', value: '200', description: 'Minimum wallet balance to withdraw (SAR)' },
    { key: 'min_withdrawal_amount', value: '100', description: 'Minimum withdrawal amount (SAR)' },
    { key: 'withdrawal_fee_percent', value: '5', description: 'Withdrawal processing fee %' },
    { key: 'subscription_bonus', value: '50', description: 'Subscription bonus in SAR (non-withdrawable)' },
    { key: 'booking_request_timeout_min', value: '30', description: 'Auto-reject bookings after X minutes' },
  ];

  for (const cfg of configs) {
    await prisma.platformConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { ...cfg, updatedBy: admin.id },
    });
  }
  console.log('✅ Platform configuration seeded');

  // ---- Seed Achievements ----
  const { seedAchievements } = await import('../src/services/streaks.js');
  await seedAchievements();
  console.log('✅ Achievements seeded');

  // ---- Seed Saudi Cities ----
  const { SAUDI_REGIONS } = await import('../src/utils/saudiCities.js');
  let citiesSeeded = 0;
  for (const region of SAUDI_REGIONS) {
    for (const city of region.cities) {
      await prisma.saudiCity.upsert({
        where: {
          nameAr_regionAr: {
            nameAr: city.nameAr,
            regionAr: region.nameAr,
          },
        },
        update: { nameEn: city.nameEn, regionEn: region.nameEn },
        create: {
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          regionAr: region.nameAr,
          regionEn: region.nameEn,
        },
      });
      citiesSeeded++;
    }
  }
  console.log(`✅ ${citiesSeeded} Saudi cities seeded`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
