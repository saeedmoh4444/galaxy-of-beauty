import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateBookingCode(): string {
  return `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  console.log('🌱 Seeding Galaxy of Beauty database...\n');

  // ---- Clean existing data (in dependency order) ----
  const db = prisma as any;
  await prisma.$transaction([
    // FK children first
    db.giftCardTransaction.deleteMany(),
    db.promoUsage.deleteMany(),
    db.geoPromotion.deleteMany(),
    db.liveStream.deleteMany(),
    db.eventRegistration.deleteMany(),
    db.communityLike.deleteMany(),
    db.communityComment.deleteMany(),
    db.communityPost.deleteMany(),
    db.courseEnrollment.deleteMany(),
    db.beautyPackageService.deleteMany(),
    db.groupBookingMember.deleteMany(),
    db.bridalService.deleteMany(),
    db.customerFavorite.deleteMany(),
    db.moodBoardPin.deleteMany(),
    db.challengeParticipant.deleteMany(),
    // Parent tables
    db.walletTransaction.deleteMany(),
    db.loyaltyTransaction.deleteMany(),
    db.loyaltyReward.deleteMany(),
    db.loyaltyAccount.deleteMany(),
    db.payout.deleteMany(),
    db.payment.deleteMany(),
    db.review.deleteMany(),
    db.dispute.deleteMany(),
    db.notification.deleteMany(),
    db.waitlistEntry.deleteMany(),
    db.wishlistItem.deleteMany(),
    db.booking.deleteMany(),
    db.availabilitySlot.deleteMany(),
    db.technicianService.deleteMany(),
    db.serviceAddon.deleteMany(),
    db.serviceVariant.deleteMany(),
    db.serviceTagAssignment.deleteMany(),
    db.serviceTag.deleteMany(),
    db.service.deleteMany(),
    db.category.deleteMany(),
    db.technicianBadgeAssignment.deleteMany(),
    db.technicianBadge.deleteMany(),
    db.technician.deleteMany(),
    db.address.deleteMany(),
    db.wallet.deleteMany(),
    db.streak.deleteMany(),
    db.userAchievement.deleteMany(),
    db.achievement.deleteMany(),
    db.referral.deleteMany(),
    db.refreshToken.deleteMany(),
    db.termsAcceptance.deleteMany(),
    db.chatMessage.deleteMany(),
    db.customerQuizResponse.deleteMany(),
    db.customerAiSubscription.deleteMany(),
    db.aiSubscriptionPlan.deleteMany(),
    db.zatcaInvoice.deleteMany(),
    db.auditLog.deleteMany(),
    db.platformConfig.deleteMany(),
    db.blogPost.deleteMany(),
    db.beautyEvent.deleteMany(),
    db.campaign.deleteMany(),
    db.flashDeal.deleteMany(),
    db.beautyCourse.deleteMany(),
    db.corporatePlan.deleteMany(),
    db.giftQuizRecommendation.deleteMany(),
    db.giftQuizQuestion.deleteMany(),
    db.groupBuyDeal.deleteMany(),
    db.communityLook.deleteMany(),
    db.compareProduct.deleteMany(),
    db.matchmakerQuestion.deleteMany(),
    db.user.deleteMany(),
    db.saudiCity.deleteMany(),
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
  console.log('✅ Admin user created (admin@galaxyofbeauty.sa / password masked)');

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

  // ---- New Features (Post-MVP) ----

  // Seed blog posts
  const blog1 = await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أسرار العناية بالبشرة في الصيف', en: 'Summer Skincare Secrets' },
      bodyJson: { ar: '<p>في فصل الصيف، تحتاج بشرتكِ إلى عناية خاصة...</p>', en: '<p>During summer, your skin needs special care...</p>' },
      slug: 'summer-skincare-secrets',
      tags: ['skincare', 'summer', 'tips'],
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  const blog2 = await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أحدث صيحات مكياج ٢٠٢٦', en: '2026 Makeup Trends' },
      bodyJson: { ar: '<p>اكتشفي أحدث صيحات المكياج لهذا العام...</p>', en: '<p>Discover the latest makeup trends...</p>' },
      slug: '2026-makeup-trends',
      tags: ['makeup', 'trends'],
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Blog posts');

  // Seed technician badges
  const badge1 = await prisma.technicianBadge.create({ data: { key: 'bridal_specialist', nameJson: { ar: 'أخصائية عرايس', en: 'Bridal Specialist' } } });
  const badge2 = await prisma.technicianBadge.create({ data: { key: 'organic_products', nameJson: { ar: 'منتجات عضوية', en: 'Organic Products' } } });
  const badge3 = await prisma.technicianBadge.create({ data: { key: 'celebrity_stylist', nameJson: { ar: 'مصففة مشاهير', en: 'Celebrity Stylist' } } });
  console.log('✅ Technician badges');

  // Seed beauty events
  await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'ورشة العناية بالبشرة', en: 'Skincare Workshop' },
      descriptionJson: { ar: 'تعلمي أساسيات العناية بالبشرة من خبراء التجميل', en: 'Learn skincare basics from beauty experts' },
      eventType: 'workshop',
      location: 'الرياض - مركز التجميل',
      price: 100,
      maxAttendees: 20,
      startsAt: new Date(Date.now() + 7 * 86400000),
      endsAt: new Date(Date.now() + 7 * 86400000 + 3 * 3600000),
      isPublished: true,
    },
  });
  console.log('✅ Beauty events');

  // Seed campaign
  await prisma.campaign.create({
    data: {
      nameJson: { ar: 'عرض الصيف - خصم ٢٠٪', en: 'Summer Sale - 20% Off' },
      descriptionJson: { ar: 'خصم ٢٠٪ على جميع خدمات العناية بالبشرة', en: '20% off all skincare services' },
      discountType: 'percent',
      discountValue: 20,
      promoCode: 'SUMMER20',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 86400000),
      isActive: true,
    },
  });
  console.log('✅ Campaigns');

  // ---- Beauty Courses ----
  const courses = await Promise.all([
    prisma.beautyCourse.create({ data: { titleJson: { ar: 'أساسيات المكياج الاحترافي', en: 'Professional Makeup Basics' }, instructor: 'نورة العمري', lessons: 8, duration: '٤ ساعات', level: 'beginner', category: 'makeup', emoji: '💄', rating: 4.8 } }),
    prisma.beautyCourse.create({ data: { titleJson: { ar: 'فن العناية بالبشرة', en: 'Art of Skincare' }, instructor: 'د. ليلى القحطاني', lessons: 6, duration: '٣ ساعات', level: 'beginner', category: 'skincare', emoji: '✨', rating: 4.9 } }),
    prisma.beautyCourse.create({ data: { titleJson: { ar: 'تسريحات شعر للمناسبات', en: 'Occasion Hairstyling' }, instructor: 'سارة الحربي', lessons: 10, duration: '٥ ساعات', level: 'intermediate', category: 'hair', emoji: '💇‍♀️', rating: 4.7 } }),
    prisma.beautyCourse.create({ data: { titleJson: { ar: 'فن الأظافر المتقدم', en: 'Advanced Nail Art' }, instructor: 'هند المطيري', lessons: 5, duration: '٢.٥ ساعة', level: 'advanced', category: 'nails', emoji: '💅', rating: 4.6 } }),
  ]);
  console.log(`   ${courses.length} beauty courses`);

  // ---- Corporate Plans ----
  await prisma.corporatePlan.createMany({ data: [
    { key: 'starter', nameJson: { ar: 'الباقة الأساسية', en: 'Starter' }, price: 5000, employees: 10, services: ['مانيكير', 'مساج سريع', 'استشارة عناية'], emoji: '🌱' },
    { key: 'growth', nameJson: { ar: 'باقة النمو', en: 'Growth' }, price: 12000, employees: 50, services: ['مانيكير', 'باديكير', 'مساج', 'تنظيف بشرة', 'استشارة'], emoji: '🌿' },
    { key: 'enterprise', nameJson: { ar: 'الباقة الشاملة', en: 'Enterprise' }, price: 25000, employees: 200, services: ['كل الخدمات', 'يوم سبا', 'ورش عناية', 'مدير حساب'], emoji: '🌳' },
  ]});

  // ---- Gift Quiz ----
  await prisma.giftQuizQuestion.createMany({ data: [
    { questionKey: 'occasion', questionJson: { ar: 'ما هي المناسبة؟', en: 'What is the occasion?' }, options: [{ key: 'birthday', labelAr: 'عيد ميلاد 🎂', labelEn: 'Birthday', tags: ['احتفالي', 'شخصي'] }, { key: 'wedding', labelAr: 'زفاف 👰', labelEn: 'Wedding', tags: ['راقي', 'فخم'] }, { key: 'graduation', labelAr: 'تخرج 🎓', labelEn: 'Graduation', tags: ['شبابي', 'عصري'] }, { key: 'thankyou', labelAr: 'شكر وامتنان 💐', labelEn: 'Thank You', tags: ['لطيف', 'راقي'] }, { key: 'baby', labelAr: 'بيبي شاور 👶', labelEn: 'Baby Shower', tags: ['لطيف', 'عناية'] }, { key: 'justbecause', labelAr: 'بدون مناسبة 🎁', labelEn: 'Just Because', tags: ['متنوع', 'شخصي'] }] },
    { questionKey: 'recipient', questionJson: { ar: 'لمن الهدية؟', en: 'Who is the gift for?' }, options: [{ key: 'friend', labelAr: 'صديقة 👯‍♀️', labelEn: 'Friend', tags: ['عصري', 'مرح'] }, { key: 'mom', labelAr: 'أمي 👩‍👧', labelEn: 'Mom', tags: ['فخم', 'عناية'] }, { key: 'sister', labelAr: 'أختي 👭', labelEn: 'Sister', tags: ['شبابي', 'شخصي'] }, { key: 'wife', labelAr: 'زوجتي 💑', labelEn: 'Wife', tags: ['رومانسي', 'فخم'] }, { key: 'self', labelAr: 'نفسي 💝', labelEn: 'Myself', tags: ['شخصي', 'متنوع'] }] },
    { questionKey: 'budget', questionJson: { ar: 'ما هي ميزانيتك؟', en: 'What is your budget?' }, options: [{ key: 'low', labelAr: 'اقتصادية (حتى ٢٠٠ ر.س) 💰', labelEn: 'Budget (up to 200 SAR)', tags: ['اقتصادي'] }, { key: 'mid', labelAr: 'متوسطة (٢٠٠-٥٠٠ ر.س) 💵', labelEn: 'Mid (200-500 SAR)', tags: ['متوسط'] }, { key: 'high', labelAr: 'فاخرة (٥٠٠+ ر.س) 💎', labelEn: 'Premium (500+ SAR)', tags: ['فاخر'] }] },
    { questionKey: 'interest', questionJson: { ar: 'ما أكثر ما تهتم به؟', en: 'What interests them most?' }, options: [{ key: 'skincare', labelAr: 'العناية بالبشرة ✨', labelEn: 'Skincare', tags: ['عناية', 'بشرة'] }, { key: 'makeup', labelAr: 'المكياج 💄', labelEn: 'Makeup', tags: ['مكياج', 'عصري'] }, { key: 'hair', labelAr: 'العناية بالشعر 💇‍♀️', labelEn: 'Hair Care', tags: ['شعر', 'عناية'] }, { key: 'fragrance', labelAr: 'العطور 🌸', labelEn: 'Fragrance', tags: ['عطور', 'فاخر'] }, { key: 'wellness', labelAr: 'الاسترخاء والعناية 🧘', labelEn: 'Wellness & Relaxation', tags: ['استرخاء', 'صحة'] }] },
  ]});

  await prisma.giftQuizRecommendation.createMany({ data: [
    { nameJson: { ar: 'باقة عناية بالبشرة فاخرة', en: 'Premium Skincare Set' }, descJson: { ar: 'مجموعة متكاملة من كريم وسيروم وتونر' }, price: 450, category: 'skincare', emoji: '✨', tags: ['فاخر', 'عناية', 'بشرة'] },
    { nameJson: { ar: 'علبة مكياج احترافية', en: 'Pro Makeup Kit' }, descJson: { ar: '١٨ لون ظلال عيون + ٦ ألوان أحمر شفاه' }, price: 320, category: 'makeup', emoji: '💄', tags: ['مكياج', 'عصري', 'شبابي'] },
    { nameJson: { ar: 'جلسة مساج استرخائية', en: 'Relaxation Massage' }, descJson: { ar: 'جلسة مساج ٦٠ دقيقة مع زيوت عطرية' }, price: 250, category: 'wellness', emoji: '💆‍♀️', tags: ['استرخاء', 'صحة'] },
    { nameJson: { ar: 'بطاقة هدية جالكسي بيوتي', en: 'Galaxy Gift Card' }, descJson: { ar: 'قيمة ٣٠٠ ر.س' }, price: 300, category: 'giftcard', emoji: '🎁', tags: ['مرن', 'شخصي', 'متوسط'] },
  ]});

  // ---- Group Buy Deals ----
  await prisma.groupBuyDeal.createMany({ data: [
    { service: 'مكياج احترافي', originalPrice: 300, groupPrice: 200, minBuyers: 5, currentBuyers: 3, endsIn: '٣ أيام', emoji: '💄', savings: 100 },
    { service: 'تنظيف بشرة', originalPrice: 200, groupPrice: 140, minBuyers: 3, currentBuyers: 2, endsIn: 'يومين', emoji: '✨', savings: 60 },
    { service: 'مساج استرخائي', originalPrice: 250, groupPrice: 180, minBuyers: 4, currentBuyers: 4, endsIn: 'يوم', emoji: '💆‍♀️', savings: 70 },
  ]});

  // ---- Community Looks ----
  await prisma.communityLook.createMany({ data: [
    { userName: 'نورة', title: 'إطلالة سهرة ناعمة', technicianName: 'نورة العمري', votes: 245, category: 'makeup' },
    { userName: 'مها', title: 'تسريحة شعر راقية', technicianName: 'سارة الحربي', votes: 189, category: 'hair' },
    { userName: 'ريم', title: 'أظافر صيفية', technicianName: 'هند المطيري', votes: 156, category: 'nails' },
  ]});

  // ---- Compare Products ----
  await prisma.compareProduct.createMany({ data: [
    { nameJson: { ar: 'كريم ترطيب يومي' }, brand: 'Nivea', price: 89, rating: 4.5, category: 'skincare', emoji: '🧴', features: { hydration: 85, absorption: 80, value: 90, gentle: 75 }, ingredients: 12, crueltyFree: false, vegan: false },
    { nameJson: { ar: 'مرطب طبيعي' }, brand: 'Organic Beauty', price: 120, rating: 4.8, category: 'skincare', emoji: '🌿', features: { hydration: 92, absorption: 88, value: 75, gentle: 95 }, ingredients: 6, crueltyFree: true, vegan: true },
    { nameJson: { ar: 'سيروم فيتامين C' }, brand: 'The Ordinary', price: 145, rating: 4.9, category: 'skincare', emoji: '✨', features: { hydration: 70, absorption: 95, value: 85, gentle: 80 }, ingredients: 8, crueltyFree: true, vegan: true },
    { nameJson: { ar: 'أحمر شفاه مطفي' }, brand: 'MAC', price: 110, rating: 4.3, category: 'makeup', emoji: '💄', features: { hydration: 60, absorption: 70, value: 65, gentle: 60 }, ingredients: 18, crueltyFree: false, vegan: false },
  ]});

  // ---- Matchmaker ----
  await prisma.matchmakerQuestion.createMany({ data: [
    { questionKey: 'occasion', question: 'ما هي المناسبة؟', options: [{ k: 'daily', l: 'يومي ☀️', t: ['basic'] }, { k: 'work', l: 'عمل 💼', t: ['natural'] }, { k: 'party', l: 'حفلة 🎉', t: ['glam'] }, { k: 'wedding', l: 'زفاف 👰', t: ['luxury'] }, { k: 'date', l: 'موعد رومانسي 💑', t: ['elegant'] }] },
    { questionKey: 'budget', question: 'ميزانيتك؟', options: [{ k: 'low', l: 'اقتصادية 💰', t: ['budget'] }, { k: 'mid', l: 'متوسطة 💵', t: ['standard'] }, { k: 'high', l: 'فاخرة 💎', t: ['premium'] }] },
    { questionKey: 'area', question: 'ما تهتمين به؟', options: [{ k: 'face', l: 'وجه ✨', t: ['skincare', 'makeup'] }, { k: 'hair', l: 'شعر 💇‍♀️', t: ['hair'] }, { k: 'body', l: 'جسم 🧖‍♀️', t: ['massage', 'spa'] }, { k: 'nails', l: 'أظافر 💅', t: ['nails'] }, { k: 'all', l: 'كل شيء 🌟', t: ['full'] }] },
  ]});

  await prisma.matchmakerService.createMany({ data: [
    { nameAr: 'مكياج احترافي', emoji: '💄', price: 300, tags: ['glam', 'luxury', 'makeup', 'premium'] },
    { nameAr: 'تنظيف بشرة عميق', emoji: '✨', price: 200, tags: ['skincare', 'standard', 'basic'] },
    { nameAr: 'تسريحة شعر', emoji: '💇‍♀️', price: 200, tags: ['hair', 'elegant', 'standard'] },
    { nameAr: 'مساج استرخائي', emoji: '💆‍♀️', price: 250, tags: ['massage', 'spa', 'standard'] },
    { nameAr: 'مانيكير وباديكير', emoji: '💅', price: 180, tags: ['nails', 'basic', 'budget'] },
    { nameAr: 'حمام مغربي', emoji: '🧖‍♀️', price: 350, tags: ['spa', 'luxury', 'full', 'premium'] },
    { nameAr: 'مكياج طبيعي', emoji: '🌸', price: 200, tags: ['natural', 'makeup', 'daily', 'budget'] },
    { nameAr: 'عناية بالبشرة', emoji: '🧴', price: 150, tags: ['skincare', 'basic', 'daily', 'budget'] },
  ]});

  // ---- Summary (existing data) ----
  console.log(`   ${categories.length} categories, ${services.length} services`);
  console.log(`   ${cities.length} Saudi cities, ${tags.length} tags, ${achievements.length} achievements`);

  // ──────────────────────────────────────────────────────────
  // E2E Test Data — customers, technicians, bookings, reviews
  // ──────────────────────────────────────────────────────────

  const customerPasswordHash = '$2b$12$WLl1knNaSSoIuae5Pjcd9.5IlMOPSEb8w5dd/22Kyxmkw5Sei2Wvi'; // Admin@123456

  // Test customer
  const customer = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      phone: '+966512345678',
      passwordHash: customerPasswordHash,
      name: 'نورة العمري',
      role: 'CUSTOMER',
      emailVerified: true,
      preferredLanguage: 'ar',
    },
  });
  await prisma.wallet.create({ data: { userId: customer.id, balance: 500, bonusBalance: 50 } });
  await prisma.streak.create({ data: { customerId: customer.id, currentStreak: 3, longestStreak: 5 } });
  console.log('✅ Test customer (customer@test.com / Admin@123456)');

  // More customers
  const names = ['سارة الحربي', 'مها القحطاني', 'ريم المطيري', 'هند الشمري', 'لطيفة العتيبي'];
  const customers = [customer];
  for (let i = 0; i < names.length; i++) {
    const c = await prisma.user.create({
      data: {
        email: `customer${i + 2}@test.com`,
        phone: `+96651234567${i + 9}`,
        passwordHash: customerPasswordHash,
        name: names[i]!,
        role: 'CUSTOMER',
        emailVerified: true,
        preferredLanguage: 'ar',
      },
    });
    await prisma.wallet.create({ data: { userId: c.id, balance: 200 + i * 100, bonusBalance: 0 } });
    customers.push(c);
  }
  console.log(`✅ ${customers.length} customers`);

  // Technicians
  const techData = [
    { name: 'نورة العمري', email: 'tech1@test.com', speciality: 'makeup', rating: 4.9, city: 'الرياض' },
    { name: 'سارة الحربي', email: 'tech2@test.com', speciality: 'hair', rating: 4.8, city: 'جدة' },
    { name: 'د. ليلى القحطاني', email: 'tech3@test.com', speciality: 'skincare', rating: 4.9, city: 'الدمام' },
  ];
  const technicians: Record<string, any>[] = [];
  for (const td of techData) {
    const u = await prisma.user.create({
      data: {
        email: td.email,
        phone: `+9665${Math.floor(Math.random() * 90000000 + 10000000)}`,
        passwordHash: customerPasswordHash,
        name: td.name,
        role: 'TECHNICIAN',
        emailVerified: true,
        preferredLanguage: 'ar',
      },
    });
    await prisma.wallet.create({ data: { userId: u.id, balance: 0, bonusBalance: 0 } });
    const tech = await prisma.technician.create({
      data: {
        userId: u.id,
        city: td.city,
        ratingAvg: td.rating,
        completedBookings: Math.floor(Math.random() * 50 + 10),
        kycStatus: 'VERIFIED',
      },
    });
    // Assign services to technician
    await prisma.technicianService.create({
      data: { technicianId: tech.id, serviceId: services[Math.floor(Math.random() * services.length)]!.id, customPrice: 0, isActive: true },
    });
    technicians.push({ ...tech, user: u });
  }
  console.log(`✅ ${technicians.length} technicians`);

  // Availability slots for next 7 days
  let slotCount = 0;
  for (const tech of technicians) {
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(9, 0, 0, 0);
      for (let h = 0; h < 8; h++) {
        const start = new Date(date.getTime() + h * 90 * 60000);
        const end = new Date(start.getTime() + 60 * 60000);
        await prisma.availabilitySlot.create({
          data: { technicianId: tech.id, startAt: start, endAt: end, isAvailable: true, isBooked: false },
        });
        slotCount++;
      }
    }
  }
  console.log(`✅ ${slotCount} availability slots`);

  // Addresses for first customer
  const addr1 = await prisma.address.create({
    data: { userId: customer.id, label: 'المنزل', city: 'الرياض', area: 'الملز', street: 'شارع التحلية', lat: 24.7136, lng: 46.6753, isDefault: true },
  });
  console.log('✅ Customer address');

  // Bookings with various statuses
  const bookingStatuses: Array<{ status: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'; daysAgo: number }> = [
    { status: 'COMPLETED', daysAgo: 7 },
    { status: 'COMPLETED', daysAgo: 14 },
    { status: 'ACCEPTED', daysAgo: 1 },
    { status: 'REQUESTED', daysAgo: 0 },
    { status: 'IN_PROGRESS', daysAgo: 0 },
    { status: 'CANCELLED', daysAgo: 3 },
  ];
  let bookingCount = 0;
  for (const bs of bookingStatuses) {
    try {
      const startAt = new Date();
      startAt.setDate(startAt.getDate() - bs.daysAgo);
      startAt.setHours(14, 0, 0, 0);
      const endAt = new Date(startAt.getTime() + 60 * 60000);
      const svc = services[bookingCount % services.length]!;
      const tech = technicians[bookingCount % technicians.length]!;
      await (prisma as any).booking.create({
        data: {
          bookingCode: generateBookingCode(),
          customerId: customers[bookingCount % customers.length]!.id,
          technicianId: tech.user.id,
          serviceId: svc.id,
          addressId: addr1.id,
          startAt,
          endAt,
          status: bs.status,
          totalAmount: Number(svc.basePrice),
          platformFee: 11,
        },
      });
      bookingCount++;
    } catch (err: any) {
      console.log(`   ⚠️ Booking ${bs.status} skipped: ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(`✅ ${bookingCount} bookings`);

  // Reviews
  let reviewCount = 0;
  const reviewComments = ['خدمة ممتازة وأنيقة!', 'رائعة جداً، سأكرر التجربة', 'محترفة ونظيفة، شكراً', 'أفضل فنية جربتها'];
  for (let i = 0; i < 4; i++) {
    try {
      await (prisma as any).review.create({
        data: {
          userId: customers[i % customers.length]!.id,
          technicianId: technicians[i % technicians.length]!.id,
          serviceId: services[i % services.length]!.id,
          rating: 4 + (i % 2),
          comment: reviewComments[i]!,
        },
      });
      reviewCount++;
    } catch { /* skip if booking reference missing */ }
  }
  console.log(`✅ ${reviewCount} reviews`);

  // Wallet transactions
  try {
    const customerWallet = await (prisma as any).wallet.findUnique({ where: { userId: customer.id } });
    if (customerWallet) {
      await (prisma as any).walletTransaction.createMany({
        data: [
          { walletId: customerWallet.id, amount: 500, type: 'CREDIT', source: 'PLATFORM_FEE_SHARE', description: 'إيداع أولي', referenceId: 'topup_init' },
          { walletId: customerWallet.id, amount: 50, type: 'CREDIT', source: 'CASHBACK', description: 'كاش باك من الحجز', referenceId: 'booking_1' },
        ],
      });
      console.log('✅ Wallet transactions');
    }
  } catch (err: any) { console.log(`   ⚠️ Wallet tx: ${err.message?.slice(0,60)}`); }

  // Reviews for completed bookings
  try {
    const reviewComments = ['خدمة ممتازة وأنيقة!', 'رائعة جداً، سأكرر التجربة', 'محترفة ونظيفة، شكراً', 'أفضل فنية جربتها'];
    let reviewCount = 0;
    const allBookings = await (prisma as any).booking.findMany({ where: { status: 'COMPLETED' }, take: 4 });
    for (let i = 0; i < allBookings.length; i++) {
      try {
        await (prisma as any).review.create({
          data: { bookingId: allBookings[i].id, customerId: allBookings[i].customerId, rating: 4 + (i % 2), comment: reviewComments[i]! },
        });
        reviewCount++;
      } catch { /* skip if duplicate */ }
    }
    if (reviewCount > 0) console.log(`✅ ${reviewCount} reviews`);
  } catch (err: any) { console.log(`   ⚠️ Reviews: ${err.message?.slice(0,60)}`); }

  // Loyalty, notifications, wishlist, flash deal
  try {
    await (prisma as any).loyaltyAccount.create({ data: { userId: customer.id, points: 650, lifetimePoints: 1200, tier: 'GOLD' } });
    await (prisma as any).notification.createMany({
      data: [
        { userId: customer.id, title: 'تم تأكيد حجزك', body: 'تم قبول حجزك من قبل نورة العمري', type: 'booking_accepted', isRead: false },
        { userId: customer.id, title: 'عرض خاص', body: 'خصم ٢٠٪ على خدمات المساج', type: 'promo', isRead: false },
      ],
    });
    await (prisma as any).wishlistItem.createMany({ data: [{ userId: customer.id, serviceId: services[3]!.id }] });
    await (prisma as any).flashDeal.create({
      data: { serviceId: services[0]!.id, titleAr: 'خصم ٤٠٪', discountPercent: 40, originalPrice: Number(services[0]!.basePrice), dealPrice: Number(services[0]!.basePrice) * 0.6, discountValue: Number(services[0]!.basePrice) * 0.4, maxRedemptions: 20, startsAt: new Date(), endsAt: new Date(Date.now() + 24 * 3600000), isActive: true },
    });
    console.log('✅ Loyalty, notifications, wishlist, flash deal');
  } catch (err: any) { console.log(`   ⚠️ Extra data: ${err.message?.slice(0,60)}`); }

  // Promo codes
  try {
    await (prisma as any).promoCode.createMany({
      data: [
        { code: 'WELCOME20', discountType: 'percent', discountValue: 20, minOrderAmount: 100, maxUses: 100, currentUses: 12, isActive: true, validUntil: new Date(Date.now() + 30 * 86400000), createdBy: admin.id },
        { code: 'FLASH50', discountType: 'percent', discountValue: 50, minOrderAmount: 200, maxUses: 50, currentUses: 45, isActive: true, validUntil: new Date(Date.now() + 7 * 86400000), createdBy: admin.id },
        { code: 'SAVE50SAR', discountType: 'fixed', discountValue: 50, minOrderAmount: 150, maxUses: 200, currentUses: 87, isActive: true, validUntil: new Date(Date.now() + 60 * 86400000), createdBy: admin.id },
        { code: 'EXPIRED10', discountType: 'percent', discountValue: 10, maxUses: 50, currentUses: 50, isActive: false, validUntil: new Date(Date.now() - 1 * 86400000), createdBy: admin.id },
        { code: 'BIG100', discountType: 'fixed', discountValue: 100, minOrderAmount: 500, maxUses: 20, currentUses: 3, isActive: true, validUntil: new Date(Date.now() + 14 * 86400000), createdBy: admin.id },
      ],
    });
    console.log('✅ 5 promo codes (active + expired)');
  } catch (err: any) { console.log(`   ⚠️ Promo codes: ${err.message?.slice(0,60)}`); }

  // Gift cards
  try {
    await (prisma as any).giftCard.createMany({
      data: [
        { code: 'GIFT-2024-001', amount: 200, balance: 200, purchaserId: customer.id, recipientEmail: 'friend@test.com', recipientName: 'مها', message: 'هدية عيد ميلاد سعيد! 🎂', status: 'ACTIVE', expiresAt: new Date(Date.now() + 365 * 86400000) },
        { code: 'GIFT-2024-002', amount: 100, balance: 0, purchaserId: customer.id, recipientEmail: 'sister@test.com', recipientName: 'ريم', message: 'لكِ مع حبي 💝', status: 'REDEEMED', expiresAt: new Date(Date.now() + 365 * 86400000) },
        { code: 'GIFT-2024-003', amount: 500, balance: 500, purchaserId: customers[1]!.id, recipientName: 'سارة', status: 'ACTIVE', expiresAt: new Date(Date.now() + 180 * 86400000) },
      ],
    });
    console.log('✅ 3 gift cards (active + redeemed)');
  } catch (err: any) { console.log(`   ⚠️ Gift cards: ${err.message?.slice(0,60)}`); }

  // ── Geo Promotions ──
  try {
    await db.geoPromotion.createMany({
      data: [
        {
          titleJson: { ar: 'خصم ٣٠٪ على العناية بالبشرة', en: '30% off Skincare' },
          descriptionJson: { ar: 'خصم خاص لسكان الرياض على جميع خدمات العناية بالبشرة', en: 'Special discount for Riyadh residents on all skincare services' },
          city: 'الرياض', lat: 24.7136, lng: 46.6753, radiusKm: 10, discountPct: 30, maxDiscount: 100,
          startsAt: new Date(), endsAt: new Date(Date.now() + 14 * 86400000), isActive: true, createdBy: admin.id,
        },
        {
          titleJson: { ar: 'خصم ٢٥٪ على المساج', en: '25% off Massage' },
          descriptionJson: { ar: 'استمتعي بجلسة مساج استرخائي بخصم ٢٥٪ في جدة', en: 'Enjoy a relaxation massage with 25% off in Jeddah' },
          city: 'جدة', lat: 21.5433, lng: 39.1728, radiusKm: 8, discountPct: 25, maxDiscount: 80,
          startsAt: new Date(), endsAt: new Date(Date.now() + 10 * 86400000), isActive: true, createdBy: admin.id,
        },
        {
          titleJson: { ar: 'خصم ٤٠٪ للطلب الأول', en: '40% off First Order' },
          descriptionJson: { ar: 'خصم ترحيبي للعميلات الجدد في جميع المدن', en: 'Welcome discount for new customers in all cities' },
          city: 'الرياض', lat: 24.7136, lng: 46.6753, radiusKm: 50, discountPct: 40, maxDiscount: 150,
          startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 86400000), isActive: true, createdBy: admin.id,
        },
        {
          titleJson: { ar: 'عرض نهاية الأسبوع', en: 'Weekend Special' },
          descriptionJson: { ar: 'خصم ٢٠٪ على جميع خدمات التجميل في عطلة نهاية الأسبوع', en: '20% off all beauty services during the weekend' },
          city: 'الدمام', lat: 26.4207, lng: 50.0888, radiusKm: 15, discountPct: 20, maxDiscount: 60,
          startsAt: new Date(), endsAt: new Date(Date.now() + 7 * 86400000), isActive: true, createdBy: admin.id,
        },
        {
          titleJson: { ar: 'عرض الصيف الحار', en: 'Hot Summer Deal' },
          descriptionJson: { ar: 'خصم ١٥٪ على خدمات العناية بالشعر والأظافر', en: '15% off hair and nail care services' },
          city: 'جدة', lat: 21.5433, lng: 39.1728, radiusKm: 20, discountPct: 15, maxDiscount: 50,
          startsAt: new Date(Date.now() + 7 * 86400000), endsAt: new Date(Date.now() + 45 * 86400000), isActive: true, createdBy: admin.id,
        },
      ],
    });
    console.log('✅ 5 geo promotions');
  } catch (err: any) { console.log(`   ⚠️ Geo promotions: ${err.message?.slice(0,60)}`); }

  // ── Live Streams ──
  try {
    await db.liveStream.createMany({
      data: [
        {
          technicianId: technicians[0]!.user.id,
          titleJson: { ar: 'جلسة مكياج سهرة مباشرة', en: 'Live Evening Makeup Session' },
          descriptionJson: { ar: 'تعلمي أساسيات مكياج السهرات مع نورة', en: 'Learn evening makeup basics with Noura' },
          category: 'makeup', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 2 * 86400000), isFeatured: true,
        },
        {
          technicianId: technicians[1]?.user.id ?? customer.id,
          titleJson: { ar: 'أسرار العناية بالشعر', en: 'Hair Care Secrets' },
          descriptionJson: { ar: 'اكتشفي أفضل الطرق للعناية بشعرك', en: 'Discover the best ways to care for your hair' },
          category: 'hair', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 4 * 86400000), isFeatured: true,
        },
        {
          technicianId: technicians[2]?.user.id ?? customer.id,
          titleJson: { ar: 'روتين العناية بالبشرة', en: 'Skincare Routine' },
          descriptionJson: { ar: 'روتين يومي للعناية بالبشرة مع د. ليلى', en: 'Daily skincare routine with Dr. Laila' },
          category: 'skincare', status: 'LIVE', streamUrl: 'https://youtube.com/embed/example1', scheduledAt: new Date(Date.now() - 3600000), startedAt: new Date(Date.now() - 3600000), viewerCount: 234, isFeatured: true,
        },
        {
          technicianId: technicians[0]!.user.id,
          titleJson: { ar: 'فن الأظافر الاحترافي', en: 'Professional Nail Art' },
          descriptionJson: { ar: 'تعلمي أحدث صيحات الأظافر', en: 'Learn the latest nail art trends' },
          category: 'nails', status: 'ENDED', scheduledAt: new Date(Date.now() - 7 * 86400000), startedAt: new Date(Date.now() - 7 * 86400000), endedAt: new Date(Date.now() - 7 * 86400000 + 3600000), recordingUrl: 'https://youtube.com/watch?v=example', viewerCount: 1520,
        },
        {
          technicianId: technicians[1]?.user.id ?? customer.id,
          titleJson: { ar: 'تسريحات شعر للمناسبات', en: 'Occasion Hairstyles' },
          descriptionJson: { ar: 'تسريحات شعر راقية للمناسبات الخاصة', en: 'Elegant hairstyles for special occasions' },
          category: 'hair', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 5 * 86400000),
        },
      ],
    });
    console.log('✅ 5 live streams');
  } catch (err: any) { console.log(`   ⚠️ Live streams: ${err.message?.slice(0,60)}`); }

  console.log('\n🎉 Seed complete! Test login: customer@test.com / Admin@123456\n');
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
