import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateBookingCode(): string {
  return `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  console.log('🌱 Seeding Galaxy of Beauty database...\n');

  // ---- Clean existing data (in dependency order) ----
  await prisma.$transaction([
    prisma.walletTransaction.deleteMany(),
    prisma.payout.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.review.deleteMany(),
    prisma.dispute.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.waitlistEntry.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.availabilitySlot.deleteMany(),
    prisma.technicianService.deleteMany(),
    prisma.serviceAddon.deleteMany(),
    prisma.serviceVariant.deleteMany(),
    prisma.serviceTagAssignment.deleteMany(),
    prisma.serviceTag.deleteMany(),
    prisma.service.deleteMany(),
    prisma.category.deleteMany(),
    prisma.technician.deleteMany(),
    prisma.address.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.streak.deleteMany(),
    prisma.userAchievement.deleteMany(),
    prisma.achievement.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.termsAcceptance.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.customerQuizResponse.deleteMany(),
    prisma.customerAiSubscription.deleteMany(),
    prisma.aiSubscriptionPlan.deleteMany(),
    prisma.zatcaInvoice.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.platformConfig.deleteMany(),
    prisma.user.deleteMany(),
    prisma.saudiCity.deleteMany(),
  ]);

  console.log('✅ Cleaned existing data');

  // ---- Saudi Cities ----
  const cities = [
    { nameAr: 'الرياض', nameEn: 'Riyadh', regionAr: 'منطقة الرياض', regionEn: 'Riyadh Region' },
    { nameAr: 'جدة', nameEn: 'Jeddah', regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region' },
    { nameAr: 'مكة المكرمة', nameEn: 'Makkah', regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region' },
    { nameAr: 'المدينة المنورة', nameEn: 'Madinah', regionAr: 'منطقة المدينة المنورة', regionEn: 'Madinah Region' },
    { nameAr: 'الدمام', nameEn: 'Dammam', regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Region' },
    { nameAr: 'الخبر', nameEn: 'Khobar', regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Region' },
    { nameAr: 'الظهران', nameEn: 'Dhahran', regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Region' },
    { nameAr: 'الطائف', nameEn: 'Taif', regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region' },
    { nameAr: 'تبوك', nameEn: 'Tabuk', regionAr: 'منطقة تبوك', regionEn: 'Tabuk Region' },
    { nameAr: 'أبها', nameEn: 'Abha', regionAr: 'منطقة عسير', regionEn: 'Asir Region' },
  ];

  for (const city of cities) {
    await prisma.saudiCity.create({ data: city });
  }
  console.log(`✅ ${cities.length} Saudi cities`);

  // ---- Admin User ----
  // Password: Admin@123456
  const adminPasswordHash = '$2b$12$WLl1knNaSSoIuae5Pjcd9.5IlMOPSEb8w5dd/22Kyxmkw5Sei2Wvi'; // Admin@123456

  const admin = await prisma.user.create({
    data: {
      email: 'admin@galaxyofbeauty.sa',
      phone: '+966500000001',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
      emailVerified: true,
      phoneVerified: true,
      preferredLanguage: 'ar',
    },
  });

  await prisma.wallet.create({
    data: { userId: admin.id, balance: 0, bonusBalance: 0 },
  });
  console.log('✅ Admin user (admin@galaxyofbeauty.sa / Admin@123456)');

  // ---- Platform Config ----
  await prisma.platformConfig.createMany({
    data: [
      { key: 'platformFeeSar', value: '11', description: 'Platform fee in SAR per booking', updatedBy: admin.id },
      { key: 'cashbackFirstBookingPercent', value: '40', description: 'Cashback % for first booking', updatedBy: admin.id },
      { key: 'cashbackSubsequentPercent', value: '5', description: 'Cashback % for subsequent bookings', updatedBy: admin.id },
      { key: 'minWithdrawalBalance', value: '200', description: 'Minimum balance to allow withdrawal', updatedBy: admin.id },
      { key: 'minWithdrawalAmount', value: '100', description: 'Minimum withdrawal amount', updatedBy: admin.id },
      { key: 'withdrawalFeePercent', value: '5', description: 'Withdrawal fee percentage', updatedBy: admin.id },
      { key: 'technicianEarningsPercent', value: '99', description: 'Technician earnings share', updatedBy: admin.id },
      { key: 'termsVersion', value: '1.0', description: 'Current terms version', updatedBy: admin.id },
      { key: 'maintenanceMode', value: 'false', description: 'Maintenance mode toggle', updatedBy: admin.id },
    ],
  });
  console.log('✅ Platform configuration');

  // ---- Categories (6 root categories) ----
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالشعر', en: 'Hair Care' },
        slug: 'hair-care',
        sortOrder: 1,
        iconUrl: '/icons/hair.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالأظافر', en: 'Nail Care' },
        slug: 'nail-care',
        sortOrder: 2,
        iconUrl: '/icons/nails.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالبشرة', en: 'Skin Care' },
        slug: 'skin-care',
        sortOrder: 3,
        iconUrl: '/icons/skin.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'المكياج', en: 'Makeup' },
        slug: 'makeup',
        sortOrder: 4,
        iconUrl: '/icons/makeup.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'المساج والاسترخاء', en: 'Massage & Relaxation' },
        slug: 'massage',
        sortOrder: 5,
        iconUrl: '/icons/massage.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'الحناء', en: 'Henna' },
        slug: 'henna',
        sortOrder: 6,
        iconUrl: '/icons/henna.svg',
      },
    }),
  ]);
  console.log(`✅ ${categories.length} root categories`);

  // ---- Sub-categories ----
  await Promise.all([
    prisma.category.create({
      data: { nameJson: { ar: 'قص الشعر', en: 'Haircut' }, slug: 'haircut', parentId: categories[0]!.id, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'صبغ الشعر', en: 'Hair Color' }, slug: 'hair-color', parentId: categories[0]!.id, sortOrder: 2 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'تسريحات', en: 'Hairstyling' }, slug: 'hairstyling', parentId: categories[0]!.id, sortOrder: 3 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'مانيكير', en: 'Manicure' }, slug: 'manicure', parentId: categories[1]!.id, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'بديكير', en: 'Pedicure' }, slug: 'pedicure', parentId: categories[1]!.id, sortOrder: 2 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'تنظيف البشرة', en: 'Facial Cleansing' }, slug: 'facial-cleansing', parentId: categories[2]!.id, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'مكياج سهرات', en: 'Evening Makeup' }, slug: 'evening-makeup', parentId: categories[3]!.id, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'مكياج عرايس', en: 'Bridal Makeup' }, slug: 'bridal-makeup', parentId: categories[3]!.id, sortOrder: 2 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'مساج سويدي', en: 'Swedish Massage' }, slug: 'swedish-massage', parentId: categories[4]!.id, sortOrder: 1 },
    }),
    prisma.category.create({
      data: { nameJson: { ar: 'حناء سوداء', en: 'Black Henna' }, slug: 'black-henna', parentId: categories[5]!.id, sortOrder: 1 },
    }),
  ]);
  console.log('✅ 10 sub-categories');

  // ---- Services ----
  const services = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'قص شعر كامل', en: 'Full Haircut' },
        descriptionJson: { ar: 'قصة شعر احترافية مع غسيل وتصفيف', en: 'Professional haircut with wash and styling' },
        basePrice: 80,
        durationMin: 45,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'صبغ شعر كامل', en: 'Full Hair Color' },
        descriptionJson: { ar: 'صبغ شعر كامل بألوان عالية الجودة', en: 'Full hair coloring with high-quality products' },
        basePrice: 200,
        durationMin: 120,
        isPopular: true,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[1]!.id,
        titleJson: { ar: 'مانيكير جل', en: 'Gel Manicure' },
        basePrice: 100,
        durationMin: 60,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[2]!.id,
        titleJson: { ar: 'تنظيف بشرة عميق', en: 'Deep Facial Cleansing' },
        basePrice: 150,
        durationMin: 75,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[3]!.id,
        titleJson: { ar: 'مكياج عرايس كامل', en: 'Full Bridal Makeup' },
        descriptionJson: { ar: 'مكياج عرايس متكامل مع تجربة قبل الحفل', en: 'Complete bridal makeup with pre-event trial' },
        basePrice: 600,
        durationMin: 180,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[4]!.id,
        titleJson: { ar: 'مساج استرخائي', en: 'Relaxation Massage' },
        basePrice: 200,
        durationMin: 60,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[5]!.id,
        titleJson: { ar: 'حناء نقش', en: 'Henna Art' },
        basePrice: 120,
        durationMin: 90,
        sortOrder: 1,
      },
    }),
  ]);
  console.log(`✅ ${services.length} services`);

  // ---- Service Variants ----
  await prisma.serviceVariant.createMany({
    data: [
      { serviceId: services[0]!.id, nameJson: { ar: 'شعر طويل', en: 'Long Hair' }, priceDelta: 20, durationDelta: 15 },
      { serviceId: services[0]!.id, nameJson: { ar: 'شعر قصير', en: 'Short Hair' }, priceDelta: 0, durationDelta: 0 },
      { serviceId: services[1]!.id, nameJson: { ar: 'شعر طويل', en: 'Long Hair' }, priceDelta: 50, durationDelta: 30 },
      { serviceId: services[1]!.id, nameJson: { ar: 'شعر قصير', en: 'Short Hair' }, priceDelta: 0, durationDelta: 0 },
      { serviceId: services[4]!.id, nameJson: { ar: 'مع تجربة', en: 'With Trial' }, priceDelta: 200, durationDelta: 60 },
    ],
  });
  console.log('✅ Service variants');

  // ---- Service Tags ----
  const tags = await Promise.all([
    prisma.serviceTag.create({ data: { nameJson: { ar: 'مناسب للعرايس', en: 'Bridal' }, slug: 'bridal' } }),
    prisma.serviceTag.create({ data: { nameJson: { ar: 'منتجات عضوية', en: 'Organic Products' }, slug: 'organic' } }),
    prisma.serviceTag.create({ data: { nameJson: { ar: 'خدمة منزلية', en: 'Home Service' }, slug: 'home-service' } }),
    prisma.serviceTag.create({ data: { nameJson: { ar: 'نتائج سريعة', en: 'Quick Results' }, slug: 'quick' } }),
  ]);

  await prisma.serviceTagAssignment.createMany({
    data: [
      { serviceId: services[4]!.id, tagId: tags[0]!.id },
      { serviceId: services[1]!.id, tagId: tags[1]!.id },
      { serviceId: services[2]!.id, tagId: tags[1]!.id },
    ],
  });
  console.log(`✅ ${tags.length} service tags`);

  // ---- Achievements ----
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        key: 'first_booking',
        nameJson: { ar: 'أول حجز', en: 'First Booking' },
        descriptionJson: { ar: 'أكملي حجزك الأول', en: 'Complete your first booking' },
        rewardAmount: 10,
      },
    }),
    prisma.achievement.create({
      data: {
        key: 'five_bookings',
        nameJson: { ar: 'خمس حجوزات', en: 'Five Bookings' },
        descriptionJson: { ar: 'أكملي ٥ حجوزات', en: 'Complete 5 bookings' },
        rewardAmount: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        key: 'weekly_streak',
        nameJson: { ar: 'استمرارية أسبوعية', en: 'Weekly Streak' },
        descriptionJson: { ar: 'حافظي على حجوزاتك لمدة ٤ أسابيع متتالية', en: 'Maintain bookings for 4 consecutive weeks' },
        rewardAmount: 30,
      },
    }),
  ]);
  console.log(`✅ ${achievements.length} achievements`);

  // ---- AI Subscription Plans ----
  await prisma.aiSubscriptionPlan.createMany({
    data: [
      {
        nameJson: { ar: 'الباقة الأساسية', en: 'Basic Plan' },
        feature: 'CHATBOT',
        monthlyLimit: 100,
        priceMonthly: 29,
      },
      {
        nameJson: { ar: 'الباقة المتقدمة', en: 'Pro Plan' },
        feature: 'RECOMMENDATIONS',
        monthlyLimit: 500,
        priceMonthly: 79,
      },
      {
        nameJson: { ar: 'باقة التحليلات', en: 'Analytics Plan' },
        feature: 'CHATBOT',
        monthlyLimit: 1000,
        priceMonthly: 149,
      },
    ],
  });
  console.log('✅ AI subscription plans');

  // ---- Summary ----
  console.log('\n🎉 Seed complete!');
  console.log('   Admin: admin@galaxyofbeauty.sa / Admin@123456');
  console.log(`   ${categories.length} categories, ${services.length} services`);
  console.log(`   ${cities.length} Saudi cities, ${tags.length} tags, ${achievements.length} achievements`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
