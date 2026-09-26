// tsx does not auto-load .env — do it before ../src/client evaluates
// (client.ts captures DATABASE_URL at import time).
import 'dotenv/config';
import { prisma } from '../src/client';
import type { Prisma } from '../src';
import crypto from 'crypto';

function generateBookingCode(): string {
  return `GOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function main() {
  console.log(' Seeding Galaxy of Beauty database...\n');

  // ---- Clean existing data (in dependency order) ----
  const db = prisma as any;
  await prisma.$transaction([
    // FK children first
    db.giftCardTransaction.deleteMany(),
    db.giftCard.deleteMany(),
    db.promoUsage.deleteMany(),
    db.promoCode.deleteMany(),
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
    db.servicePricing.deleteMany(),
    db.serviceBundle.deleteMany(),
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
    db.customerSubscription.deleteMany(),
    db.subscriptionPlan.deleteMany(),
    db.zatcaInvoice.deleteMany(),
    db.auditLog.deleteMany(),
    db.platformConfig.deleteMany(),
    db.blogPost.deleteMany(),
    db.beautyEvent.deleteMany(),
    db.campaign.deleteMany(),
    db.flashDeal.deleteMany(),
    db.beautyCourse.deleteMany(),
    db.beautyQuizAttempt.deleteMany(),
    db.beautyQuizQuestion.deleteMany(),
    db.dailyBeautyTip.deleteMany(),
    db.corporatePlan.deleteMany(),
    db.giftQuizRecommendation.deleteMany(),
    db.giftQuizQuestion.deleteMany(),
    db.groupBuyDeal.deleteMany(),
    db.communityLook.deleteMany(),
    db.compareProduct.deleteMany(),
    db.matchmakerQuestion.deleteMany(),
    db.notificationTemplate.deleteMany(),
    // Marketplace + provider submission tables (B.3/B.6) — vendor rows
    // reference users, so they must be wiped before db.user.deleteMany().
    db.cartItem.deleteMany(),
    db.productReview.deleteMany(),
    db.product.deleteMany(),
    db.beautyPackage.deleteMany(),
    // E2 — clinic tables reference vendors (and users), wipe before both.
    db.clinicConsultation.deleteMany(),
    db.clinicSlot.deleteMany(),
    // E3 — gym tables reference vendors (and users), wipe before both.
    db.gymClassBooking.deleteMany(),
    db.gymClass.deleteMany(),
    // E5 — nail bar tables reference vendors, wipe before both.
    db.nailBarBooking.deleteMany(),
    db.nailBarSlot.deleteMany(),
    db.vendor.deleteMany(),
    db.productCategory.deleteMany(),
    db.providerSubmission.deleteMany(),
    // E4a — cycle tables reference users, wipe before user.deleteMany().
    db.cyclePeriod.deleteMany(),
    db.cycleEntry.deleteMany(),
    db.cycleSettings.deleteMany(),
    // E4b — measurement history + installment plans (user-owned rows).
    db.measurementLog.deleteMany(),
    db.bnplPlan.deleteMany(),
    // E7 — media layer (shorts + likes).
    db.shortLike.deleteMany(),
    db.short.deleteMany(),
    // 3.1 — skin analyses reference users; wipe before user.deleteMany().
    db.skinAnalysis.deleteMany(),
    // 2.5 — social commerce posts reference users; wipe before user.deleteMany().
    db.beautyPostEngagement.deleteMany(),
    db.beautyPostComment.deleteMany(),
    db.beautyPostLike.deleteMany(),
    db.beautyPost.deleteMany(),
    db.user.deleteMany(),
    db.saudiCity.deleteMany(),
  ]);

  console.log(' Cleaned existing data');

  // ---- Saudi Cities ----
  const cities = [
    { nameAr: 'الرياض', nameEn: 'Riyadh', regionAr: 'منطقة الرياض', regionEn: 'Riyadh Region' },
    { nameAr: 'جدة', nameEn: 'Jeddah', regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region' },
    {
      nameAr: 'مكة المكرمة',
      nameEn: 'Makkah',
      regionAr: 'منطقة مكة المكرمة',
      regionEn: 'Makkah Region',
    },
    {
      nameAr: 'المدينة المنورة',
      nameEn: 'Madinah',
      regionAr: 'منطقة المدينة المنورة',
      regionEn: 'Madinah Region',
    },
    { nameAr: 'الدمام', nameEn: 'Dammam', regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Region' },
    { nameAr: 'الخبر', nameEn: 'Khobar', regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Region' },
    {
      nameAr: 'الظهران',
      nameEn: 'Dhahran',
      regionAr: 'المنطقة الشرقية',
      regionEn: 'Eastern Region',
    },
    { nameAr: 'الطائف', nameEn: 'Taif', regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region' },
    { nameAr: 'تبوك', nameEn: 'Tabuk', regionAr: 'منطقة تبوك', regionEn: 'Tabuk Region' },
    { nameAr: 'أبها', nameEn: 'Abha', regionAr: 'منطقة عسير', regionEn: 'Asir Region' },
  ];

  for (const city of cities) {
    await prisma.saudiCity.create({ data: city });
  }
  console.log(` ${cities.length} Saudi cities`);

  // ---- Admin User ----
  // Password: Admin@123456 (hash verified 2026-08-28 — the previous literal
  // never matched the documented password, so every seeded account was unloggable)
  const adminPasswordHash = '$2b$12$3EEqTDqBmYkYZ2baueS0I.J2EohI/RLelIDPk5jgvumJmTceUTtJe'; // Admin@123456

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
  console.log(' Admin user created (admin@galaxyofbeauty.sa / password masked)');

  // ---- Platform Config ----
  await prisma.platformConfig.createMany({
    data: [
      {
        key: 'platformFeeSar',
        value: '11',
        description: 'Platform fee in SAR per booking',
        updatedBy: admin.id,
      },
      {
        key: 'cashbackFirstBookingPercent',
        value: '40',
        description: 'Cashback % for first booking',
        updatedBy: admin.id,
      },
      {
        key: 'cashbackSubsequentPercent',
        value: '5',
        description: 'Cashback % for subsequent bookings',
        updatedBy: admin.id,
      },
      {
        key: 'minWithdrawalBalance',
        value: '200',
        description: 'Minimum balance to allow withdrawal',
        updatedBy: admin.id,
      },
      {
        key: 'minWithdrawalAmount',
        value: '100',
        description: 'Minimum withdrawal amount',
        updatedBy: admin.id,
      },
      {
        key: 'withdrawalFeePercent',
        value: '5',
        description: 'Withdrawal fee percentage',
        updatedBy: admin.id,
      },
      {
        key: 'technicianEarningsPercent',
        value: '99',
        description: 'Technician earnings share',
        updatedBy: admin.id,
      },
      {
        key: 'termsVersion',
        value: '1.0',
        description: 'Current terms version',
        updatedBy: admin.id,
      },
      {
        key: 'maintenanceMode',
        value: 'false',
        description: 'Maintenance mode toggle',
        updatedBy: admin.id,
      },
    ],
  });
  console.log(' Platform configuration');

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
    prisma.category.create({
      data: {
        nameJson: { ar: 'إزالة الشعر', en: 'Waxing & Hair Removal' },
        slug: 'waxing',
        sortOrder: 7,
        iconUrl: '/icons/waxing.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'الرموش والحواجب', en: 'Eyelash & Eyebrow' },
        slug: 'lashes-brows',
        sortOrder: 8,
        iconUrl: '/icons/lashes.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'علاجات الجسم', en: 'Body Treatments' },
        slug: 'body-treatments',
        sortOrder: 9,
        iconUrl: '/icons/body.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'خدمات العرايس', en: 'Bridal Services' },
        slug: 'bridal-services',
        sortOrder: 10,
        iconUrl: '/icons/bridal.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالرجال', en: "Men's Grooming" },
        slug: 'mens-grooming',
        sortOrder: 11,
        iconUrl: '/icons/mens.svg',
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'السبا والعافية', en: 'Spa & Wellness' },
        slug: 'spa-wellness',
        sortOrder: 12,
        iconUrl: '/icons/spa.svg',
      },
    }),
    // E3 — fitness vertical (trainers attach these via addService).
    prisma.category.create({
      data: {
        nameJson: { ar: 'اللياقة البدنية', en: 'Fitness' },
        slug: 'fitness',
        sortOrder: 13,
        iconUrl: '/icons/fitness.svg',
      },
    }),
    // E5 — barberettes (women's barbershops ride the technician engine).
    prisma.category.create({
      data: {
        nameJson: { ar: 'باربيريت — قصات عصرية', en: 'Barberette' },
        slug: 'barberette',
        sortOrder: 14,
        iconUrl: '/icons/barberette.svg',
      },
    }),
    // E6b — postpartum care (rides technicians/clinics/ATHOME vendors).
    prisma.category.create({
      data: {
        nameJson: { ar: 'رعاية ما بعد الولادة', en: 'Postpartum Care' },
        slug: 'postpartum-care',
        sortOrder: 15,
        iconUrl: '/icons/postpartum.svg',
      },
    }),
    // C3 (Tier 3 #7) — hijab-care: scalp health under hijab, henna nights.
    prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالحجاب', en: 'Hijab Care' },
        slug: 'hijab-care',
        sortOrder: 16,
        iconUrl: '/icons/hijab.svg',
      },
    }),
    // K2 (kids plan) — child-friendly beauty & grooming.
    prisma.category.create({
      data: {
        nameJson: { ar: 'خدمات الأطفال', en: 'Kids Care' },
        slug: 'kids-care',
        sortOrder: 17,
        iconUrl: '/icons/kids.svg',
      },
    }),
    // K4 (kids plan) — babysitting vertical (hourly, verified technicians).
    prisma.category.create({
      data: {
        nameJson: { ar: 'جليسة أطفال', en: 'Babysitting' },
        slug: 'babysitting',
        sortOrder: 18,
        iconUrl: '/icons/babysitting.svg',
      },
    }),
  ]);
  console.log(` ${categories.length} root categories`);

  // ---- Sub-categories ----
  await Promise.all([
    prisma.category.create({
      data: {
        nameJson: { ar: 'قص الشعر', en: 'Haircut' },
        slug: 'haircut',
        parentId: categories[0]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'صبغ الشعر', en: 'Hair Color' },
        slug: 'hair-color',
        parentId: categories[0]!.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'تسريحات', en: 'Hairstyling' },
        slug: 'hairstyling',
        parentId: categories[0]!.id,
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'مانيكير', en: 'Manicure' },
        slug: 'manicure',
        parentId: categories[1]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'بديكير', en: 'Pedicure' },
        slug: 'pedicure',
        parentId: categories[1]!.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'تنظيف البشرة', en: 'Facial Cleansing' },
        slug: 'facial-cleansing',
        parentId: categories[2]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'مكياج سهرات', en: 'Evening Makeup' },
        slug: 'evening-makeup',
        parentId: categories[3]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'مكياج عرايس', en: 'Bridal Makeup' },
        slug: 'bridal-makeup',
        parentId: categories[3]!.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'مساج سويدي', en: 'Swedish Massage' },
        slug: 'swedish-massage',
        parentId: categories[4]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'حناء سوداء', en: 'Black Henna' },
        slug: 'black-henna',
        parentId: categories[5]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'شمع', en: 'Waxing' },
        slug: 'waxing-sub',
        parentId: categories[6]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'خيط', en: 'Threading' },
        slug: 'threading',
        parentId: categories[6]!.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'رموش', en: 'Lashes' },
        slug: 'lashes',
        parentId: categories[7]!.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameJson: { ar: 'حواجب', en: 'Brows' },
        slug: 'brows',
        parentId: categories[7]!.id,
        sortOrder: 2,
      },
    }),
  ]);
  console.log(' 14 sub-categories');

  // ---- Services ----
  const services = await Promise.all([
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'قص شعر كامل', en: 'Full Haircut' },
        descriptionJson: {
          ar: 'قصة شعر احترافية مع غسيل وتصفيف',
          en: 'Professional haircut with wash and styling',
        },
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
        descriptionJson: {
          ar: 'صبغ شعر كامل بألوان عالية الجودة',
          en: 'Full hair coloring with high-quality products',
        },
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
        slug: 'manicure',
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
        slug: 'facial-cleansing',
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
        descriptionJson: {
          ar: 'مكياج عرايس متكامل مع تجربة قبل الحفل',
          en: 'Complete bridal makeup with pre-event trial',
        },
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
    // Phase 1: 8 new services (QW1 + 3 more)
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'تمويج شعر', en: 'Blow-Dry & Styling' },
        descriptionJson: {
          ar: 'تمويج شعر احترافي مع تصفيف',
          en: 'Professional blow-dry with styling',
        },
        basePrice: 100,
        durationMin: 45,
        isPopular: true,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'علاج الشعر العميق', en: 'Deep Conditioning Treatment' },
        descriptionJson: {
          ar: 'علاج ترطيب عميق للشعر التالف والجاف',
          en: 'Deep moisturizing treatment for damaged and dry hair',
        },
        basePrice: 130,
        durationMin: 60,
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[2]!.id,
        titleJson: { ar: 'تنظيف بشرة سريع', en: 'Express Facial' },
        descriptionJson: {
          ar: 'تنظيف بشرة سريع في ٣٠ دقيقة',
          en: 'Quick facial cleansing in 30 minutes',
        },
        basePrice: 90,
        durationMin: 30,
        isPopular: true,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[3]!.id,
        titleJson: { ar: 'تجربة مكياج', en: 'Makeup Trial' },
        descriptionJson: {
          ar: 'تجربة مكياج قبل المناسبة مع مناقشة الإطلالة',
          en: 'Pre-event makeup trial with look consultation',
        },
        basePrice: 150,
        durationMin: 60,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[5]!.id,
        titleJson: { ar: 'حناء عرايس', en: 'Bridal Henna' },
        descriptionJson: {
          ar: 'حناء عرايس فاخرة بنقوش معقدة تشمل اليدين والقدمين',
          en: 'Luxury bridal henna with intricate patterns covering hands and feet',
        },
        basePrice: 350,
        durationMin: 180,
        isPopular: true,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[1]!.id,
        titleJson: { ar: 'مانيكير سريع', en: 'Express Manicure' },
        descriptionJson: { ar: 'مانيكير سريع في ٢٠ دقيقة', en: 'Quick manicure in 20 minutes' },
        basePrice: 60,
        durationMin: 20,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[4]!.id,
        titleJson: { ar: 'حمام مغربي', en: 'Moroccan Bath' },
        descriptionJson: {
          ar: 'حمام مغربي تقليدي مع الصابون البلدي والليفة',
          en: 'Traditional Moroccan bath with black soap and loofah',
        },
        basePrice: 250,
        durationMin: 90,
        isPopular: true,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[0]!.id,
        titleJson: { ar: 'تسريحة عرايس', en: 'Bridal Hairstyling' },
        slug: 'hairstyling',
        descriptionJson: {
          ar: 'تسريحة شعر فاخرة للعروس مع تجربة قبل الزفاف',
          en: 'Luxury bridal hairstyle with pre-wedding trial',
        },
        basePrice: 400,
        durationMin: 120,
        isPopular: true,
        sortOrder: 5,
      },
    }),

    // Phase 1: Waxing & Hair Removal (6 services)
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر كامل الجسم', en: 'Full Body Wax' },
        descriptionJson: { ar: 'إزالة الشعر بالشمع لكامل الجسم', en: 'Full body waxing' },
        basePrice: 300,
        durationMin: 90,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر نصف الساق', en: 'Half Leg Wax' },
        basePrice: 80,
        durationMin: 20,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر برازيلي', en: 'Brazilian Wax' },
        basePrice: 150,
        durationMin: 30,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر الإبط', en: 'Underarm Wax' },
        basePrice: 40,
        durationMin: 10,
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر الوجه بالخيط', en: 'Face Threading' },
        basePrice: 50,
        durationMin: 15,
        sortOrder: 5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[6]!.id,
        titleJson: { ar: 'إزالة شعر الوجه بالشمع', en: 'Full Face Wax' },
        basePrice: 80,
        durationMin: 25,
        sortOrder: 6,
      },
    }),

    // Lash & Brow services (4)
    prisma.service.create({
      data: {
        categoryId: categories[7]!.id,
        titleJson: { ar: 'تركيب رموش كلاسيك', en: 'Classic Lash Extensions' },
        basePrice: 250,
        durationMin: 90,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[7]!.id,
        titleJson: { ar: 'تركيب رموش فوليوم', en: 'Volume Lash Extensions' },
        basePrice: 350,
        durationMin: 120,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[7]!.id,
        titleJson: { ar: 'رفع رموش وتلوين', en: 'Lash Lift & Tint' },
        basePrice: 180,
        durationMin: 45,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[7]!.id,
        titleJson: { ar: 'مايكروبليدنج حواجب', en: 'Microblading Eyebrows' },
        basePrice: 600,
        durationMin: 120,
        sortOrder: 4,
      },
    }),

    // Body Treatments (4)
    prisma.service.create({
      data: {
        categoryId: categories[8]!.id,
        titleJson: { ar: 'تقشير كامل الجسم', en: 'Full Body Scrub' },
        basePrice: 200,
        durationMin: 60,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[8]!.id,
        titleJson: { ar: 'لفة تنظيف الجسم', en: 'Detox Body Wrap' },
        basePrice: 250,
        durationMin: 75,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[8]!.id,
        titleJson: { ar: 'مساج بالزيوت العطرية', en: 'Aromatherapy Massage' },
        basePrice: 280,
        durationMin: 90,
        isPopular: true,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[8]!.id,
        titleJson: { ar: 'مساج بالأحجار الساخنة', en: 'Hot Stone Massage' },
        basePrice: 300,
        durationMin: 90,
        sortOrder: 4,
      },
    }),

    // Bridal Services (4)
    prisma.service.create({
      data: {
        categoryId: categories[9]!.id,
        titleJson: { ar: 'باقة تجربة العروس', en: 'Bridal Trial Package' },
        descriptionJson: {
          ar: 'تجربة كاملة للعروس تشمل المكياج والشعر والحناء',
          en: 'Full bridal trial with makeup, hair and henna',
        },
        basePrice: 500,
        durationMin: 180,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[9]!.id,
        titleJson: { ar: 'إشراقة ما قبل الزفاف', en: 'Pre-Wedding Glow' },
        basePrice: 400,
        durationMin: 120,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[9]!.id,
        titleJson: { ar: 'تنسيق يوم الزفاف', en: 'Wedding Day Coordination' },
        basePrice: 800,
        durationMin: 480,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[9]!.id,
        titleJson: { ar: 'باقة صديقات العروس', en: 'Bridal Party Package' },
        basePrice: 1200,
        durationMin: 240,
        sortOrder: 4,
      },
    }),

    // Men's Grooming (4)
    prisma.service.create({
      data: {
        categoryId: categories[10]!.id,
        titleJson: { ar: 'قصة شعر راقية', en: 'Premium Haircut' },
        basePrice: 100,
        durationMin: 30,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[10]!.id,
        titleJson: { ar: 'تهذيب اللحية', en: 'Beard Trim & Shape' },
        basePrice: 60,
        durationMin: 20,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[10]!.id,
        titleJson: { ar: 'عناية بالبشرة للرجال', en: "Men's Facial" },
        basePrice: 120,
        durationMin: 45,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[10]!.id,
        titleJson: { ar: 'مانيكير رجالي', en: "Men's Manicure" },
        basePrice: 80,
        durationMin: 30,
        sortOrder: 4,
      },
    }),

    // Spa & Wellness (8)
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'يوم سبا كامل', en: 'Full Spa Day' },
        descriptionJson: {
          ar: 'يوم كامل من العناية والاسترخاء',
          en: 'Full day of pampering and relaxation',
        },
        basePrice: 600,
        durationMin: 240,
        isPopular: true,
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'مساج ثنائي', en: 'Couples Massage' },
        basePrice: 500,
        durationMin: 90,
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'مساج القدمين', en: 'Foot Reflexology' },
        basePrice: 150,
        durationMin: 45,
        sortOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'مساج تايلندي', en: 'Thai Massage' },
        basePrice: 250,
        durationMin: 60,
        sortOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'حجامة', en: 'Cupping Therapy (Hijama)' },
        basePrice: 200,
        durationMin: 45,
        sortOrder: 5,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'مساج بالأعشاب', en: 'Herbal Compress Massage' },
        basePrice: 220,
        durationMin: 60,
        sortOrder: 6,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'تصريف لمفاوي', en: 'Lymphatic Drainage' },
        basePrice: 280,
        durationMin: 75,
        sortOrder: 7,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[11]!.id,
        titleJson: { ar: 'مساج الحمل', en: 'Prenatal Massage' },
        basePrice: 200,
        durationMin: 60,
        sortOrder: 8,
      },
    }),
    // E3 — fitness services (trainers attach these; the Booking engine
    // handles 1:1 sessions unchanged).
    prisma.service.create({
      data: {
        categoryId: categories[12]!.id,
        titleJson: { ar: 'جلسة تدريب شخصي', en: 'Personal Training Session' },
        descriptionJson: {
          ar: 'جلسة تدريب فردية مع مدربة معتمدة',
          en: 'One-on-one session with a certified trainer',
        },
        basePrice: 150,
        durationMin: 60,
        isPopular: true,
        slug: 'personal-training',
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[12]!.id,
        titleJson: { ar: 'بيلاتس', en: 'Pilates' },
        basePrice: 120,
        durationMin: 45,
        slug: 'pilates',
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[12]!.id,
        titleJson: { ar: 'يوغا', en: 'Yoga' },
        basePrice: 100,
        durationMin: 60,
        slug: 'yoga',
        sortOrder: 3,
      },
    }),
    // E5 — barberette services (ride the technician Booking engine unchanged).
    prisma.service.create({
      data: {
        categoryId: categories[13]!.id,
        titleJson: { ar: 'قصة بيكسي', en: 'Pixie Cut' },
        descriptionJson: { ar: 'قصة قصيرة عصرية جريئة', en: 'A bold modern short cut' },
        basePrice: 90,
        durationMin: 45,
        slug: 'pixie-cut',
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[13]!.id,
        titleJson: { ar: 'قص مدرج قصير', en: 'Layered Bob' },
        basePrice: 110,
        durationMin: 60,
        slug: 'layered-bob',
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[13]!.id,
        titleJson: { ar: 'حلاقة ناعمة', en: 'Clean Fade' },
        basePrice: 70,
        durationMin: 30,
        slug: 'clean-fade',
        sortOrder: 3,
      },
    }),
    // E6b — postpartum care services (bookable through the existing engines).
    prisma.service.create({
      data: {
        categoryId: categories[14]!.id,
        titleJson: { ar: 'تدليك التعافي بعد الولادة', en: 'Postpartum Recovery Massage' },
        descriptionJson: {
          ar: 'تدليك لطيف يساعد على الاسترخاء والتعافي',
          en: 'Gentle massage supporting relaxation and recovery',
        },
        basePrice: 200,
        durationMin: 60,
        isPopular: true,
        slug: 'postpartum-recovery-massage',
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[14]!.id,
        titleJson: { ar: 'عناية بالبشرة بعد الولادة', en: 'Postpartum Skin Care' },
        basePrice: 150,
        durationMin: 45,
        slug: 'postpartum-skin-care',
        sortOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[14]!.id,
        titleJson: { ar: 'عناية بالشعر آمنة مع الرضاعة', en: 'Nursing-Safe Hair Care' },
        basePrice: 130,
        durationMin: 60,
        slug: 'nursing-safe-hair-care',
        sortOrder: 3,
      },
    }),
    // C3 (Tier 3 #7) — hijab-care services.
    prisma.service.create({
      data: {
        categoryId: categories[15]!.id,
        titleJson: { ar: 'علاج فروة الرأس تحت الحجاب', en: 'Under-Hijab Scalp Treatment' },
        descriptionJson: {
          ar: 'عناية متخصصة بفروة الرأس للنساء المحجبات — ترطيب وتقوية',
          en: 'Specialized scalp care for hijabi women — hydration and strengthening',
        },
        basePrice: 120,
        durationMin: 45,
        slug: 'under-hijab-scalp-treatment',
        sortOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[15]!.id,
        titleJson: { ar: 'ليلة حناء للعرايس', en: 'Bridal Henna Night' },
        descriptionJson: {
          ar: 'جلسة حناء كاملة مع نقوش عصرية وتحضير ما قبل الزفاف',
          en: 'Full henna session with modern designs and pre-wedding prep',
        },
        basePrice: 350,
        durationMin: 180,
        slug: 'bridal-henna-night',
        sortOrder: 2,
      },
    }),
    // K2 (kids plan) — child services, all mommy/kid-friendly.
    prisma.service.create({
      data: {
        categoryId: categories[16]!.id,
        titleJson: { ar: 'باقة قصة الشعر الأولى', en: 'First Haircut Package' },
        descriptionJson: {
          ar: 'تجربة أول قصة شعر للصغار مع شهادة تذكارية وهدية',
          en: 'A gentle first haircut experience with a keepsake certificate and gift',
        },
        basePrice: 80,
        durationMin: 30,
        slug: 'first-haircut-package',
        sortOrder: 1,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[16]!.id,
        titleJson: { ar: 'قصة شعر للأطفال', en: 'Kids Haircut' },
        descriptionJson: {
          ar: 'قصة شعر مريحة للأطفال مع منتجات لطيفة على فروة الرأس',
          en: 'A comfortable kids haircut with scalp-gentle products',
        },
        basePrice: 60,
        durationMin: 30,
        slug: 'kids-haircut',
        sortOrder: 2,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[16]!.id,
        titleJson: { ar: 'عناية أظافر آمنة للأطفال', en: 'Kid-Safe Nail Care' },
        descriptionJson: {
          ar: 'تقليم وتنظيف الأظافر بمنتجات آمنة وخالية من العطور',
          en: 'Kid-safe nail trimming and care with fragrance-free products',
        },
        basePrice: 50,
        durationMin: 20,
        slug: 'kid-safe-nail-care',
        sortOrder: 3,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[16]!.id,
        titleJson: { ar: 'جلسة عناية لطيفة للوجه', en: 'Gentle Kids Facial' },
        descriptionJson: {
          ar: 'تنظيف لطيف للوجه بمنتجات مضادة للحساسية',
          en: 'A gentle facial cleanse with hypoallergenic products',
        },
        basePrice: 90,
        durationMin: 25,
        slug: 'gentle-kids-facial',
        sortOrder: 4,
        isMommyFriendly: true,
      },
    }),
  ]);
  console.log(` ${services.length} services`);

  // ---- K4 (kids plan) — babysitting services: hourly pricing
  // (basePrice = hourly rate), women-only staff, kid-safe environment.
  await Promise.all([
    prisma.service.create({
      data: {
        categoryId: categories[17]!.id,
        titleJson: { ar: 'جليسة أطفال موثقة', en: 'Verified Babysitter' },
        descriptionJson: {
          ar: 'جليسة موثقة بخبرة مع الأطفال — بالمنزل، مع أنشطة آمنة وترفيهية',
          en: 'A verified babysitter with childcare experience — at home, with safe and fun activities',
        },
        basePrice: 50,
        durationMin: 60,
        slug: 'verified-babysitter',
        sortOrder: 1,
        isHourly: true,
        isWomenOnlyStaff: true,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[17]!.id,
        titleJson: { ar: 'جليسة مسائية', en: 'Evening Babysitter' },
        descriptionJson: {
          ar: 'رعاية مسائية هادئة — عشاء وقصة قبل النوم وإشراف كامل',
          en: 'Calm evening care — dinner, bedtime story, and full supervision',
        },
        basePrice: 60,
        durationMin: 60,
        slug: 'evening-babysitter',
        sortOrder: 2,
        isHourly: true,
        isWomenOnlyStaff: true,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId: categories[17]!.id,
        titleJson: { ar: 'جليسة رضع', en: 'Infant Babysitter' },
        descriptionJson: {
          ar: 'رعاية متخصصة للرضع — تغذية وتغيير ونوم آمن',
          en: 'Specialized infant care — feeding, changing, and safe sleep',
        },
        basePrice: 80,
        durationMin: 60,
        slug: 'infant-babysitter',
        sortOrder: 3,
        isHourly: true,
        isWomenOnlyStaff: true,
        isMommyFriendly: true,
      },
    }),
  ]);
  console.log(' 3 babysitting services (hourly)');

  // ---- K3 (kids plan) — Mommy & Me bundles: mother service + child
  // service booked as ONE booking at the bundle price.
  const svcBySlug = (slug: string) => {
    const svc = services.find((s) => s.slug === slug);
    if (!svc) throw new Error(`Seed: service slug not found: ${slug}`);
    return svc;
  };
  const bundleData = [
    {
      slug: 'mommy-and-me-mani',
      nameJson: { ar: 'باقة ماما وأنا — مانيكير', en: 'Mommy & Me — Manicure' },
      descriptionJson: {
        ar: 'مانيكير للأم وعناية أظافر آمنة للطفلة في جلسة واحدة',
        en: 'A manicure for mom and kid-safe nail care for the little one, in one session',
      },
      bundlePrice: 150,
      primary: 'manicure',
      child: 'kid-safe-nail-care',
    },
    {
      slug: 'mommy-and-me-hair',
      nameJson: { ar: 'باقة ماما وأنا — تسريحة', en: 'Mommy & Me — Hairstyle' },
      descriptionJson: {
        ar: 'تسريحة شعر للأم وقصة شعر مريحة للطفلة',
        en: 'A hairstyle for mom and a comfortable haircut for the child',
      },
      bundlePrice: 200,
      primary: 'hairstyling',
      child: 'kids-haircut',
    },
    {
      slug: 'mommy-and-me-skin',
      nameJson: { ar: 'باقة ماما وأنا — بشرة', en: 'Mommy & Me — Skin' },
      descriptionJson: {
        ar: 'تنظيف وجه للأم وجلسة عناية لطيفة لوجه الطفلة',
        en: 'A facial cleanse for mom and a gentle facial for the child',
      },
      bundlePrice: 250,
      primary: 'facial-cleansing',
      child: 'gentle-kids-facial',
    },
    {
      slug: 'mommy-and-me-wedding',
      nameJson: { ar: 'باقة ماما وأنا — زفاف', en: 'Mommy & Me — Wedding' },
      descriptionJson: {
        ar: 'ليلة حناء للأم وباقة قصة الشعر الأولى للصغيرة',
        en: "A henna night for mom and the little one's first haircut package",
      },
      bundlePrice: 500,
      primary: 'bridal-henna-night',
      child: 'first-haircut-package',
    },
  ];
  await Promise.all(
    bundleData.map((b, i) =>
      prisma.serviceBundle.create({
        data: {
          slug: b.slug,
          nameJson: b.nameJson,
          descriptionJson: b.descriptionJson,
          bundlePrice: b.bundlePrice,
          isMommyAndMe: true,
          isActive: true,
          sortOrder: i + 1,
          primaryServiceId: svcBySlug(b.primary).id,
          childServiceId: svcBySlug(b.child).id,
        },
      }),
    ),
  );
  console.log(` ${bundleData.length} mommy-and-me bundles`);

  // ---- 1.2 Service Bundles (pre-built packages) ----
  // Arabic-first packages (our_galaxy_of_beauty §3.1, adapted to the seeded
  // catalog). Idempotent: upsert by Arabic title so re-seeds don't stack
  // duplicates or orphan booking links.
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const svcByArTitle = (ar: string) => {
    const svc = services.find((s) => (s.titleJson as { ar: string }).ar === ar);
    if (!svc) throw new Error(`Seed: service not found by title: ${ar}`);
    return svc;
  };
  const beautyBundleDefs = [
    {
      titleJson: { ar: 'الباقة الذهبية', en: 'Golden Package' },
      descriptionJson: {
        ar: 'مانيكير + تنظيف بشرة + مساج — يوم عناية كامل',
        en: 'Manicure + facial + massage — a full care day',
      },
      discountPct: 15,
      sortOrder: 1,
      services: ['مانيكير جل', 'تنظيف بشرة عميق', 'مساج استرخائي'],
    },
    {
      titleJson: { ar: 'باقة العروس', en: 'Bridal Package' },
      descriptionJson: {
        ar: 'مكياج عرايس كامل + حناء نقش + تمويج شعر',
        en: 'Full bridal makeup + henna art + styling',
      },
      discountPct: 15,
      sortOrder: 2,
      services: ['مكياج عرايس كامل', 'حناء نقش', 'تمويج شعر'],
    },
    {
      titleJson: { ar: 'باقة السهرة', en: 'Evening Package' },
      descriptionJson: {
        ar: 'مكياج + تسريحة + مانيكير لإطلالة سهرة متكاملة',
        en: 'Makeup + styling + manicure for a complete evening look',
      },
      discountPct: 15,
      sortOrder: 3,
      services: ['مكياج عرايس كامل', 'تمويج شعر', 'مانيكير جل'],
    },
    {
      titleJson: { ar: 'باقة الاسترخاء', en: 'Spa Package' },
      descriptionJson: {
        ar: 'مساج + تنظيف بشرة + مانيكير — استرخاء من الرأس للأظافر',
        en: 'Massage + facial + manicure — head-to-nails relaxation',
      },
      discountPct: 15,
      sortOrder: 4,
      services: ['مساج استرخائي', 'تنظيف بشرة عميق', 'مانيكير جل'],
    },
    {
      titleJson: { ar: 'باقة العناية', en: 'Care Package' },
      descriptionJson: {
        ar: 'صبغ + علاج عميق + تمويج للعناية الكاملة بالشعر',
        en: 'Color + deep treatment + styling for complete hair care',
      },
      discountPct: 15,
      sortOrder: 5,
      services: ['صبغ شعر كامل', 'علاج الشعر العميق', 'تمويج شعر'],
    },
    {
      titleJson: { ar: 'باقة العيد', en: 'Eid Package' },
      descriptionJson: {
        ar: 'حناء + تنظيف بشرة + مانيكير — إطلالة العيد كاملة',
        en: 'Henna + facial + manicure — the complete Eid look',
      },
      discountPct: 15,
      sortOrder: 6,
      isSeasonal: true,
      season: 'EID',
      services: ['حناء نقش', 'تنظيف بشرة عميق', 'مانيكير جل'],
    },
  ] as const;
  for (const def of beautyBundleDefs) {
    const svcIds = def.services.map((ar) => svcByArTitle(ar).id);
    const original = round2(
      svcIds.reduce((sum, id) => sum + Number(services.find((s) => s.id === id)!.basePrice), 0),
    );
    const total = round2(original * (1 - def.discountPct / 100));
    const data = {
      titleJson: def.titleJson,
      descriptionJson: def.descriptionJson,
      serviceIds: svcIds,
      discountPct: def.discountPct,
      originalPrice: original,
      totalPrice: total,
      isSeasonal: def.isSeasonal ?? false,
      season: def.season ?? null,
      sortOrder: def.sortOrder,
      isActive: true,
    };
    const existing = await prisma.beautyBundle.findFirst({
      where: { titleJson: { path: ['ar'], equals: def.titleJson.ar } },
    });
    if (existing) {
      await prisma.beautyBundle.update({ where: { id: existing.id }, data });
    } else {
      await prisma.beautyBundle.create({ data });
    }
  }
  console.log(` ${beautyBundleDefs.length} beauty bundles (1.2)`);

  // ---- 1.4 Seasonal & Event Services ----
  // Wide rolling windows (the season filter from lib/season gates
  // visibility); admins narrow real windows via seasonalServices.update.
  // Idempotent: upsert by (season, Arabic name).
  const seasonalDefs = [
    {
      ar: 'باقة ما قبل الإفطار',
      en: 'Pre-Iftar Glow',
      season: 'RAMADAN',
      categoryIdx: 3,
      premium: 30,
    },
    {
      ar: 'حناء ليالي رمضان',
      en: 'Ramadan Night Henna',
      season: 'RAMADAN',
      categoryIdx: 5,
      premium: 20,
    },
    {
      ar: 'إطلالة العيد الكاملة',
      en: 'Complete Eid Look',
      season: 'EID',
      categoryIdx: 3,
      premium: 40,
    },
    {
      ar: 'باقة العيد العائلية',
      en: 'Eid Family Package',
      season: 'EID',
      categoryIdx: 2,
      premium: 60,
    },
    { ar: 'توهج التخرج', en: 'Graduation Glow', season: 'GRADUATION', categoryIdx: 2, premium: 25 },
    {
      ar: 'مكياج التخرج',
      en: 'Graduation Makeup',
      season: 'GRADUATION',
      categoryIdx: 3,
      premium: 15,
    },
    {
      ar: 'إطلالة فالنتاين',
      en: 'Valentine Look',
      season: 'VALENTINE',
      categoryIdx: 3,
      premium: 20,
    },
    {
      ar: 'سبا اليوم الوردي',
      en: 'Pink Day Spa',
      season: 'VALENTINE',
      categoryIdx: 4,
      premium: 35,
    },
  ] as const;
  for (const def of seasonalDefs) {
    const existing = await prisma.seasonalService.findFirst({
      where: {
        season: def.season,
        nameJson: { path: ['ar'], equals: def.ar },
      },
    });
    const data = {
      nameJson: { ar: def.ar, en: def.en },
      categoryId: categories[def.categoryIdx]!.id,
      season: def.season,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T23:59:59.000Z'),
      pricePremium: def.premium,
      isActive: true,
    };
    if (existing) {
      await prisma.seasonalService.update({ where: { id: existing.id }, data });
    } else {
      await prisma.seasonalService.create({ data });
    }
  }
  console.log(` ${seasonalDefs.length} seasonal services (1.4)`);

  // ---- Service Variants ----
  await prisma.serviceVariant.createMany({
    data: [
      {
        serviceId: services[0]!.id,
        nameJson: { ar: 'شعر طويل', en: 'Long Hair' },
        priceDelta: 20,
        durationDelta: 15,
      },
      {
        serviceId: services[0]!.id,
        nameJson: { ar: 'شعر قصير', en: 'Short Hair' },
        priceDelta: 0,
        durationDelta: 0,
      },
      {
        serviceId: services[1]!.id,
        nameJson: { ar: 'شعر طويل', en: 'Long Hair' },
        priceDelta: 50,
        durationDelta: 30,
      },
      {
        serviceId: services[1]!.id,
        nameJson: { ar: 'شعر قصير', en: 'Short Hair' },
        priceDelta: 0,
        durationDelta: 0,
      },
      {
        serviceId: services[4]!.id,
        nameJson: { ar: 'مع تجربة', en: 'With Trial' },
        priceDelta: 200,
        durationDelta: 60,
      },
    ],
  });
  console.log(' Service variants');

  // ---- Service Tags ----
  const tags = await Promise.all([
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'مناسب للعرايس', en: 'Bridal' }, slug: 'bridal' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'منتجات عضوية', en: 'Organic Products' }, slug: 'organic' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'خدمة منزلية', en: 'Home Service' }, slug: 'home-service' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'نتائج سريعة', en: 'Quick Results' }, slug: 'quick' },
    }),
    // Women-only tags
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'آمن للحوامل', en: 'Pregnancy Safe' }, slug: 'pregnancy-safe' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'مناسب للمراهقات', en: 'Teen Friendly' }, slug: 'teen-friendly' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'خصوصية تامة', en: 'Full Privacy' }, slug: 'full-privacy' },
    }),
    prisma.serviceTag.create({
      data: { nameJson: { ar: 'نسائي فقط', en: 'Women Only' }, slug: 'women-only' },
    }),
  ]);

  await prisma.serviceTagAssignment.createMany({
    data: [
      { serviceId: services[4]!.id, tagId: tags[0]!.id },
      { serviceId: services[1]!.id, tagId: tags[1]!.id },
      { serviceId: services[2]!.id, tagId: tags[1]!.id },
      // Women-only tag assignments
      { serviceId: services[5]!.id, tagId: tags[4]!.id }, // Bridal Makeup → Pregnancy Safe
      { serviceId: services[1]!.id, tagId: tags[5]!.id }, // Full Haircut → Teen Friendly
      { serviceId: services[3]!.id, tagId: tags[6]!.id }, // Gel Manicure → Full Privacy
      { serviceId: services[0]!.id, tagId: tags[7]!.id }, // Full Haircut → Women Only
    ],
  });
  console.log(` ${tags.length} service tags`);

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
        descriptionJson: {
          ar: 'حافظي على حجوزاتك لمدة ٤ أسابيع متتالية',
          en: 'Maintain bookings for 4 consecutive weeks',
        },
        rewardAmount: 30,
      },
    }),
  ]);
  console.log(` ${achievements.length} achievements`);

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
  console.log(' AI subscription plans');

  // ---- New Features (Post-MVP) ----

  // Seed blog posts
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أسرار العناية بالبشرة في الصيف', en: 'Summer Skincare Secrets' },
      bodyJson: {
        ar: '<p>في فصل الصيف، تحتاج بشرتكِ إلى عناية خاصة...</p>',
        en: '<p>During summer, your skin needs special care...</p>',
      },
      slug: 'summer-skincare-secrets',
      tags: ['skincare', 'summer', 'tips'],
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أحدث صيحات مكياج ٢٠٢٦', en: '2026 Makeup Trends' },
      bodyJson: {
        ar: '<p>اكتشفي أحدث صيحات المكياج لهذا العام...</p>',
        en: '<p>Discover the latest makeup trends...</p>',
      },
      slug: '2026-makeup-trends',
      tags: ['makeup', 'trends'],
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'روتين العناية بالبشرة اليومي', en: 'Daily Skincare Routine' },
      bodyJson: {
        ar: '<p>العناية اليومية بالبشرة هي أساس الجمال...</p>',
        en: '<p>Daily skincare is the foundation of beauty...</p>',
      },
      slug: 'daily-skincare-routine',
      tags: ['skincare', 'routine'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أفضل زيوت الشعر الطبيعية', en: 'Best Natural Hair Oils' },
      bodyJson: {
        ar: '<p>اكتشفي أفضل الزيوت الطبيعية لشعر صحي ولامع...</p>',
        en: '<p>Discover the best natural oils...</p>',
      },
      slug: 'best-natural-hair-oils',
      tags: ['hair', 'natural'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 10 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'دليل العروس لإطلالة مثالية', en: 'Bridal Beauty Guide' },
      bodyJson: {
        ar: '<p>كل ما تحتاجين معرفته للحصول على إطلالة زفاف مثالية...</p>',
        en: '<p>Everything you need for a perfect wedding look...</p>',
      },
      slug: 'bridal-beauty-guide',
      tags: ['bridal', 'makeup', 'skincare'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 14 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'فوائد المساج للصحة النفسية', en: 'Massage Benefits for Mental Health' },
      bodyJson: {
        ar: '<p>المساج ليس مجرد رفاهية، بل هو علاج للصحة النفسية...</p>',
        en: '<p>Massage is not just luxury...</p>',
      },
      slug: 'massage-mental-health',
      tags: ['massage', 'wellness', 'health'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 21 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'الحناء: فن وتقليد سعودي', en: 'Henna: Saudi Art & Tradition' },
      bodyJson: {
        ar: '<p>الحناء جزء لا يتجزأ من التراث السعودي...</p>',
        en: '<p>Henna is an integral part of Saudi heritage...</p>',
      },
      slug: 'henna-saudi-tradition',
      tags: ['henna', 'tradition', 'culture'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 30 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'دليل إزالة الشعر: أي طريقة تناسبك؟', en: 'Hair Removal Guide' },
      bodyJson: {
        ar: '<p>الشمع أم الخيط أم الليزر؟ دليل شامل لاختيار الطريقة المناسبة...</p>',
        en: '<p>Wax, thread, or laser? A complete guide...</p>',
      },
      slug: 'hair-removal-guide',
      tags: ['waxing', 'tips'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 5 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'أسرار الرموش الطويلة', en: 'Secrets of Long Lashes' },
      bodyJson: {
        ar: '<p>كل ما تحتاجين معرفته عن تركيب الرموش والعناية بها...</p>',
        en: '<p>Everything about lash extensions and care...</p>',
      },
      slug: 'long-lashes-secrets',
      tags: ['lashes', 'beauty'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
  });
  await prisma.blogPost.create({
    data: {
      titleJson: { ar: 'فوائد المساج وأنواعه', en: 'Massage Types & Benefits' },
      bodyJson: {
        ar: '<p>من المساج التايلندي إلى الحجامة، تعرفي على أنواع المساج وفوائده...</p>',
        en: '<p>From Thai massage to cupping, discover massage types...</p>',
      },
      slug: 'massage-types-benefits',
      tags: ['massage', 'wellness', 'spa'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 86400000),
    },
  });
  console.log(' Blog posts');

  // Seed technician badges
  await prisma.technicianBadge.create({
    data: { key: 'bridal_specialist', nameJson: { ar: 'أخصائية عرايس', en: 'Bridal Specialist' } },
  });
  await prisma.technicianBadge.create({
    data: { key: 'organic_products', nameJson: { ar: 'منتجات عضوية', en: 'Organic Products' } },
  });
  await prisma.technicianBadge.create({
    data: { key: 'celebrity_stylist', nameJson: { ar: 'مصففة مشاهير', en: 'Celebrity Stylist' } },
  });
  console.log(' Technician badges');

  // Seed beauty events
  await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'ورشة العناية بالبشرة', en: 'Skincare Workshop' },
      descriptionJson: {
        ar: 'تعلمي أساسيات العناية بالبشرة من خبراء التجميل',
        en: 'Learn skincare basics from beauty experts',
      },
      eventType: 'workshop',
      location: 'الرياض - مركز التجميل',
      price: 100,
      maxAttendees: 20,
      startsAt: new Date(Date.now() + 7 * 86400000),
      endsAt: new Date(Date.now() + 7 * 86400000 + 3 * 3600000),
      isPublished: true,
    },
  });
  await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'دورة مكياج احترافي', en: 'Professional Makeup Course' },
      descriptionJson: {
        ar: 'تعلمي أساسيات المكياج الاحترافي مع خبيرة تجميل',
        en: 'Learn professional makeup basics',
      },
      eventType: 'masterclass',
      location: 'جدة - فندق الريتز كارلتون',
      price: 300,
      maxAttendees: 15,
      startsAt: new Date(Date.now() + 14 * 86400000),
      endsAt: new Date(Date.now() + 14 * 86400000 + 5 * 3600000),
      isPublished: true,
    },
  });
  await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'يوم سبا رمضاني', en: 'Ramadan Spa Day' },
      descriptionJson: {
        ar: 'استرخي قبل الإفطار مع يوم سبا كامل',
        en: 'Relax before Iftar with a full spa day',
      },
      eventType: 'seasonal',
      location: 'الرياض - سبا النخيل',
      price: 450,
      maxAttendees: 10,
      startsAt: new Date(Date.now() + 20 * 86400000),
      endsAt: new Date(Date.now() + 20 * 86400000 + 6 * 3600000),
      isPublished: true,
    },
  });
  console.log(' Beauty events');

  // Seed campaign
  await prisma.campaign.create({
    data: {
      nameJson: { ar: 'عرض الصيف - خصم ٢٠٪', en: 'Summer Sale - 20% Off' },
      descriptionJson: {
        ar: 'خصم ٢٠٪ على جميع خدمات العناية بالبشرة',
        en: '20% off all skincare services',
      },
      discountType: 'percent',
      discountValue: 20,
      promoCode: 'SUMMER20',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 86400000),
      isActive: true,
    },
  });
  await prisma.campaign.create({
    data: {
      nameJson: { ar: 'عرض العيد - خصم ٢٥٪', en: 'Eid Sale - 25% Off' },
      descriptionJson: {
        ar: 'خصم ٢٥٪ على جميع خدمات التجميل بمناسبة العيد',
        en: '25% off all beauty services for Eid',
      },
      discountType: 'percent',
      discountValue: 25,
      promoCode: 'EID25',
      startsAt: new Date(Date.now() + 15 * 86400000),
      endsAt: new Date(Date.now() + 20 * 86400000),
      isActive: true,
    },
  });
  await prisma.campaign.create({
    data: {
      nameJson: { ar: 'عرض التخرج - خصم ٣٠٪', en: 'Graduation Sale - 30% Off' },
      descriptionJson: {
        ar: 'خصم ٣٠٪ للخريجات على جميع خدمات التجميل',
        en: '30% off for graduates on all beauty services',
      },
      discountType: 'percent',
      discountValue: 30,
      promoCode: 'GRAD30',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 60 * 86400000),
      isActive: true,
    },
  });
  console.log(' Campaigns');

  // ---- Beauty Courses ----
  const courses = await Promise.all([
    prisma.beautyCourse.create({
      data: {
        titleJson: { ar: 'أساسيات المكياج الاحترافي', en: 'Professional Makeup Basics' },
        instructor: 'نورة العمري',
        lessons: 8,
        duration: '٤ ساعات',
        level: 'beginner',
        category: 'makeup',
        emoji: '💄',
        rating: 4.8,
      },
    }),
    prisma.beautyCourse.create({
      data: {
        titleJson: { ar: 'فن العناية بالبشرة', en: 'Art of Skincare' },
        instructor: 'د. ليلى القحطاني',
        lessons: 6,
        duration: '٣ ساعات',
        level: 'beginner',
        category: 'skincare',
        emoji: '🧴',
        rating: 4.9,
      },
    }),
    prisma.beautyCourse.create({
      data: {
        titleJson: { ar: 'تسريحات شعر للمناسبات', en: 'Occasion Hairstyling' },
        instructor: 'سارة الحربي',
        lessons: 10,
        duration: '٥ ساعات',
        level: 'intermediate',
        category: 'hair',
        emoji: '💇',
        rating: 4.7,
      },
    }),
    prisma.beautyCourse.create({
      data: {
        titleJson: { ar: 'فن الأظافر المتقدم', en: 'Advanced Nail Art' },
        instructor: 'هند المطيري',
        lessons: 5,
        duration: '٢.٥ ساعة',
        level: 'advanced',
        category: 'nails',
        emoji: '💅',
        rating: 4.6,
      },
    }),
  ]);
  console.log(`   ${courses.length} beauty courses`);

  // ---- Corporate Plans ----
  await prisma.corporatePlan.createMany({
    data: [
      {
        key: 'starter',
        nameJson: { ar: 'الباقة الأساسية', en: 'Starter' },
        price: 5000,
        employees: 10,
        services: ['مانيكير', 'مساج سريع', 'استشارة عناية'],
        emoji: '🌱',
      },
      {
        key: 'growth',
        nameJson: { ar: 'باقة النمو', en: 'Growth' },
        price: 12000,
        employees: 50,
        services: ['مانيكير', 'باديكير', 'مساج', 'تنظيف بشرة', 'استشارة'],
        emoji: '📈',
      },
      {
        key: 'enterprise',
        nameJson: { ar: 'الباقة الشاملة', en: 'Enterprise' },
        price: 25000,
        employees: 200,
        services: ['كل الخدمات', 'يوم سبا', 'ورش عناية', 'مدير حساب'],
        emoji: '🏢',
      },
    ],
  });

  // ---- Gift Quiz ----
  await prisma.giftQuizQuestion.createMany({
    data: [
      {
        questionKey: 'occasion',
        questionJson: { ar: 'ما هي المناسبة؟', en: 'What is the occasion?' },
        options: [
          {
            key: 'birthday',
            labelAr: 'عيد ميلاد ',
            labelEn: 'Birthday',
            tags: ['احتفالي', 'شخصي'],
          },
          { key: 'wedding', labelAr: 'زفاف ', labelEn: 'Wedding', tags: ['راقي', 'فخم'] },
          { key: 'graduation', labelAr: 'تخرج ', labelEn: 'Graduation', tags: ['شبابي', 'عصري'] },
          {
            key: 'thankyou',
            labelAr: 'شكر وامتنان ',
            labelEn: 'Thank You',
            tags: ['لطيف', 'راقي'],
          },
          { key: 'baby', labelAr: 'بيبي شاور ', labelEn: 'Baby Shower', tags: ['لطيف', 'عناية'] },
          {
            key: 'justbecause',
            labelAr: 'بدون مناسبة ',
            labelEn: 'Just Because',
            tags: ['متنوع', 'شخصي'],
          },
        ],
      },
      {
        questionKey: 'recipient',
        questionJson: { ar: 'لمن الهدية؟', en: 'Who is the gift for?' },
        options: [
          { key: 'friend', labelAr: 'صديقة ', labelEn: 'Friend', tags: ['عصري', 'مرح'] },
          { key: 'mom', labelAr: 'أمي ', labelEn: 'Mom', tags: ['فخم', 'عناية'] },
          { key: 'sister', labelAr: 'أختي ', labelEn: 'Sister', tags: ['شبابي', 'شخصي'] },
          { key: 'wife', labelAr: 'زوجتي ', labelEn: 'Wife', tags: ['رومانسي', 'فخم'] },
          { key: 'self', labelAr: 'نفسي ', labelEn: 'Myself', tags: ['شخصي', 'متنوع'] },
        ],
      },
      {
        questionKey: 'budget',
        questionJson: { ar: 'ما هي ميزانيتك؟', en: 'What is your budget?' },
        options: [
          {
            key: 'low',
            labelAr: 'اقتصادية (حتى ٢٠٠ ر.س) ',
            labelEn: 'Budget (up to 200 SAR)',
            tags: ['اقتصادي'],
          },
          {
            key: 'mid',
            labelAr: 'متوسطة (٢٠٠-٥٠٠ ر.س) ',
            labelEn: 'Mid (200-500 SAR)',
            tags: ['متوسط'],
          },
          {
            key: 'high',
            labelAr: 'فاخرة (٥٠٠+ ر.س) ',
            labelEn: 'Premium (500+ SAR)',
            tags: ['فاخر'],
          },
        ],
      },
      {
        questionKey: 'interest',
        questionJson: { ar: 'ما أكثر ما تهتم به؟', en: 'What interests them most?' },
        options: [
          {
            key: 'skincare',
            labelAr: 'العناية بالبشرة ',
            labelEn: 'Skincare',
            tags: ['عناية', 'بشرة'],
          },
          { key: 'makeup', labelAr: 'المكياج ', labelEn: 'Makeup', tags: ['مكياج', 'عصري'] },
          {
            key: 'hair',
            labelAr: 'العناية بالشعر ',
            labelEn: 'Hair Care',
            tags: ['شعر', 'عناية'],
          },
          { key: 'fragrance', labelAr: 'العطور ', labelEn: 'Fragrance', tags: ['عطور', 'فاخر'] },
          {
            key: 'wellness',
            labelAr: 'الاسترخاء والعناية ',
            labelEn: 'Wellness & Relaxation',
            tags: ['استرخاء', 'صحة'],
          },
        ],
      },
    ],
  });

  await prisma.giftQuizRecommendation.createMany({
    data: [
      {
        nameJson: { ar: 'باقة عناية بالبشرة فاخرة', en: 'Premium Skincare Set' },
        descJson: {
          ar: 'مجموعة متكاملة من كريم وسيروم وتونر',
          en: 'A complete set of cream, serum, and toner',
        },
        price: 450,
        category: 'skincare',
        emoji: '🧴',
        tags: ['فاخر', 'عناية', 'بشرة'],
      },
      {
        nameJson: { ar: 'علبة مكياج احترافية', en: 'Pro Makeup Kit' },
        descJson: {
          ar: '١٨ لون ظلال عيون + ٦ ألوان أحمر شفاه',
          en: '18 eyeshadow shades + 6 lipstick colors',
        },
        price: 320,
        category: 'makeup',
        emoji: '💄',
        tags: ['مكياج', 'عصري', 'شبابي'],
      },
      {
        nameJson: { ar: 'جلسة مساج استرخائية', en: 'Relaxation Massage' },
        descJson: {
          ar: 'جلسة مساج ٦٠ دقيقة مع زيوت عطرية',
          en: 'A 60-minute massage with aromatic oils',
        },
        price: 250,
        category: 'wellness',
        emoji: '💆',
        tags: ['استرخاء', 'صحة'],
      },
      {
        nameJson: { ar: 'بطاقة هدية جالكسي بيوتي', en: 'Galaxy of Beauty Gift Card' },
        descJson: { ar: 'قيمة ٣٠٠ ر.س', en: 'Value: 300 SAR' },
        price: 300,
        category: 'giftcard',
        emoji: '🎁',
        tags: ['مرن', 'شخصي', 'متوسط'],
      },
    ],
  });

  // ---- Group Buy Deals ----
  await prisma.groupBuyDeal.createMany({
    data: [
      {
        service: 'مكياج احترافي',
        originalPrice: 300,
        groupPrice: 200,
        minBuyers: 5,
        currentBuyers: 3,
        endsIn: '٣ أيام',
        emoji: '💄',
        savings: 100,
      },
      {
        service: 'تنظيف بشرة',
        originalPrice: 200,
        groupPrice: 140,
        minBuyers: 3,
        currentBuyers: 2,
        endsIn: 'يومين',
        emoji: '🧖',
        savings: 60,
      },
      {
        service: 'مساج استرخائي',
        originalPrice: 250,
        groupPrice: 180,
        minBuyers: 4,
        currentBuyers: 4,
        endsIn: 'يوم',
        emoji: '💆',
        savings: 70,
      },
    ],
  });

  // ---- Community Looks ----
  await prisma.communityLook.createMany({
    data: [
      {
        userName: 'نورة',
        title: 'إطلالة سهرة ناعمة',
        technicianName: 'نورة العمري',
        votes: 245,
        category: 'makeup',
      },
      {
        userName: 'مها',
        title: 'تسريحة شعر راقية',
        technicianName: 'سارة الحربي',
        votes: 189,
        category: 'hair',
      },
      {
        userName: 'ريم',
        title: 'أظافر صيفية',
        technicianName: 'هند المطيري',
        votes: 156,
        category: 'nails',
      },
    ],
  });

  // ---- Compare Products ----
  await prisma.compareProduct.createMany({
    data: [
      {
        nameJson: { ar: 'كريم ترطيب يومي', en: 'Daily Moisturizing Cream' },
        brand: 'Nivea',
        price: 89,
        rating: 4.5,
        category: 'skincare',
        emoji: '🧴',
        features: { hydration: 85, absorption: 80, value: 90, gentle: 75 },
        ingredients: 12,
        crueltyFree: false,
        vegan: false,
      },
      {
        nameJson: { ar: 'مرطب طبيعي', en: 'Natural Moisturizer' },
        brand: 'Organic Beauty',
        price: 120,
        rating: 4.8,
        category: 'skincare',
        emoji: '🌿',
        features: { hydration: 92, absorption: 88, value: 75, gentle: 95 },
        ingredients: 6,
        crueltyFree: true,
        vegan: true,
      },
      {
        nameJson: { ar: 'سيروم فيتامين C', en: 'Vitamin C Serum' },
        brand: 'The Ordinary',
        price: 145,
        rating: 4.9,
        category: 'skincare',
        emoji: '🍊',
        features: { hydration: 70, absorption: 95, value: 85, gentle: 80 },
        ingredients: 8,
        crueltyFree: true,
        vegan: true,
      },
      {
        nameJson: { ar: 'أحمر شفاه مطفي', en: 'Matte Lipstick' },
        brand: 'MAC',
        price: 110,
        rating: 4.3,
        category: 'makeup',
        emoji: '💄',
        features: { hydration: 60, absorption: 70, value: 65, gentle: 60 },
        ingredients: 18,
        crueltyFree: false,
        vegan: false,
      },
    ],
  });

  // ---- Matchmaker ----
  await prisma.matchmakerQuestion.createMany({
    data: [
      {
        questionKey: 'occasion',
        question: 'ما هي المناسبة؟',
        options: [
          { k: 'daily', l: 'يومي ', t: ['basic'] },
          { k: 'work', l: 'عمل ', t: ['natural'] },
          { k: 'party', l: 'حفلة ', t: ['glam'] },
          { k: 'wedding', l: 'زفاف ', t: ['luxury'] },
          { k: 'date', l: 'موعد رومانسي ', t: ['elegant'] },
        ],
      },
      {
        questionKey: 'budget',
        question: 'ميزانيتك؟',
        options: [
          { k: 'low', l: 'اقتصادية ', t: ['budget'] },
          { k: 'mid', l: 'متوسطة ', t: ['standard'] },
          { k: 'high', l: 'فاخرة ', t: ['premium'] },
        ],
      },
      {
        questionKey: 'area',
        question: 'ما تهتمين به؟',
        options: [
          { k: 'face', l: 'وجه ', t: ['skincare', 'makeup'] },
          { k: 'hair', l: 'شعر ', t: ['hair'] },
          { k: 'body', l: 'جسم ', t: ['massage', 'spa'] },
          { k: 'nails', l: 'أظافر ', t: ['nails'] },
          { k: 'all', l: 'كل شيء ', t: ['full'] },
        ],
      },
    ],
  });

  await prisma.matchmakerService.createMany({
    data: [
      {
        nameAr: 'مكياج احترافي',
        emoji: '💄',
        price: 300,
        tags: ['glam', 'luxury', 'makeup', 'premium'],
      },
      {
        nameAr: 'تنظيف بشرة عميق',
        emoji: '🧖',
        price: 200,
        tags: ['skincare', 'standard', 'basic'],
      },
      { nameAr: 'تسريحة شعر', emoji: '💇', price: 200, tags: ['hair', 'elegant', 'standard'] },
      { nameAr: 'مساج استرخائي', emoji: '💆', price: 250, tags: ['massage', 'spa', 'standard'] },
      { nameAr: 'مانيكير وباديكير', emoji: '💅', price: 180, tags: ['nails', 'basic', 'budget'] },
      { nameAr: 'حمام مغربي', emoji: '🛁', price: 350, tags: ['spa', 'luxury', 'full', 'premium'] },
      {
        nameAr: 'مكياج طبيعي',
        emoji: '🌿',
        price: 200,
        tags: ['natural', 'makeup', 'daily', 'budget'],
      },
      {
        nameAr: 'عناية بالبشرة',
        emoji: '🧴',
        price: 150,
        tags: ['skincare', 'basic', 'daily', 'budget'],
      },
    ],
  });

  // ---- Summary (existing data) ----
  console.log(`   ${categories.length} categories, ${services.length} services`);
  console.log(
    `   ${cities.length} Saudi cities, ${tags.length} tags, ${achievements.length} achievements`,
  );

  // ──────────────────────────────────────────────────────────
  // E2E Test Data — customers, technicians, bookings, reviews
  // ──────────────────────────────────────────────────────────

  const customerPasswordHash = '$2b$12$3EEqTDqBmYkYZ2baueS0I.J2EohI/RLelIDPk5jgvumJmTceUTtJe'; // Admin@123456 (verified)

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
  await prisma.streak.create({
    data: { customerId: customer.id, currentStreak: 3, longestStreak: 5 },
  });
  console.log(' Test customer (customer@test.com / Admin@123456)');

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
  console.log(` ${customers.length} customers`);

  // Technicians (tier = 1.1 dynamic pricing: NEW | EXPERIENCED | PREMIUM | CELEBRITY)
  const techData = [
    {
      name: 'نورة العمري',
      email: 'tech1@test.com',
      speciality: 'makeup',
      rating: 4.9,
      city: 'الرياض',
      tier: 'CELEBRITY',
    },
    {
      name: 'سارة الحربي',
      email: 'tech2@test.com',
      speciality: 'hair',
      rating: 4.8,
      city: 'جدة',
      tier: 'PREMIUM',
    },
    {
      name: 'د. ليلى القحطاني',
      email: 'tech3@test.com',
      speciality: 'skincare',
      rating: 4.9,
      city: 'الدمام',
      tier: 'PREMIUM',
    },
    {
      name: 'هند المطيري',
      email: 'tech4@test.com',
      speciality: 'nails',
      rating: 4.7,
      city: 'جدة',
      tier: 'EXPERIENCED',
    },
    {
      name: 'عبير الزهراني',
      email: 'tech5@test.com',
      speciality: 'henna',
      rating: 4.8,
      city: 'الرياض',
      tier: 'EXPERIENCED',
    },
    {
      name: 'منال السالم',
      email: 'tech6@test.com',
      speciality: 'massage',
      rating: 4.6,
      city: 'المدينة المنورة',
      tier: 'EXPERIENCED',
    },
    {
      name: 'غادة الرشيد',
      email: 'tech7@test.com',
      speciality: 'waxing',
      rating: 4.8,
      city: 'الرياض',
      tier: 'EXPERIENCED',
    },
    {
      name: 'دلال الجهني',
      email: 'tech8@test.com',
      speciality: 'lashes',
      rating: 4.9,
      city: 'جدة',
      tier: 'PREMIUM',
    },
    {
      name: 'نوف العنزي',
      email: 'tech9@test.com',
      speciality: 'spa',
      rating: 4.7,
      city: 'الخبر',
      tier: 'NEW',
    },
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
        tier: td.tier ?? 'NEW',
      },
    });
    // Assign services to technician
    await prisma.technicianService.create({
      data: {
        technicianId: tech.id,
        serviceId: services[Math.floor(Math.random() * services.length)]!.id,
        customPrice: 0,
        isActive: true,
      },
    });
    technicians.push({ ...tech, user: u });
  }
  console.log(` ${technicians.length} technicians`);

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
          data: {
            technicianId: tech.id,
            startAt: start,
            endAt: end,
            isAvailable: true,
            isBooked: false,
          },
        });
        slotCount++;
      }
    }
  }
  console.log(` ${slotCount} availability slots`);

  // 1.1 Dynamic pricing — default peak rules: Thu/Fri/Sat evenings
  // (16:00-22:00) +30%. Rules only affect services with
  // dynamicPricingEnabled — no seeded service is enabled (admin opt-in).
  await prisma.servicePricing.createMany({
    data: [4, 5, 6].map((dayOfWeek) => ({
      serviceId: null,
      categoryId: null,
      technicianTier: null,
      dayOfWeek,
      hourStart: 16,
      hourEnd: 22,
      priceMultiplier: 1.3,
      isActive: true,
    })),
  });
  console.log(' 3 dynamic-pricing peak rules (Thu/Fri/Sat 16:00-22:00 +30%)');

  // 2.2 Beauty Subscription — Basic/Premium/VIP catalog, monthly + yearly
  // (annual = 10 monthly payments, "2 months free").
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        nameJson: { ar: 'الباقة الأساسية', en: 'Basic' },
        descriptionJson: {
          ar: 'قص شعر + مانيكير شهرياً، وخصم 10% على الخدمات الإضافية',
          en: 'Monthly haircut + manicure, 10% off additional services',
        },
        interval: 'MONTHLY',
        price: 199,
        servicesPerMonth: 2,
        discountPercent: 10,
        priorityBooking: false,
        freeHomeService: false,
        dedicatedTechnician: false,
      },
      {
        nameJson: { ar: 'الباقة المميزة', en: 'Premium' },
        descriptionJson: {
          ar: 'خدمتان من اختيارك + فيشل شهرياً، خصم 15%، وأولوية في الحجز',
          en: '2 services of choice + a facial monthly, 15% off, priority booking',
        },
        interval: 'MONTHLY',
        price: 399,
        servicesPerMonth: 3,
        discountPercent: 15,
        priorityBooking: true,
        freeHomeService: false,
        dedicatedTechnician: false,
      },
      {
        nameJson: { ar: 'الباقة الملكية', en: 'VIP' },
        descriptionJson: {
          ar: 'خدمات غير محدودة (حتى 8 شهرياً)، خصم 20% على المنتجات، فنية مخصصة، وخدمة منزلية مجانية',
          en: 'Unlimited services (up to 8/mo), 20% off products, dedicated technician, free home service',
        },
        interval: 'MONTHLY',
        price: 799,
        servicesPerMonth: 8,
        discountPercent: 20,
        priorityBooking: true,
        freeHomeService: true,
        dedicatedTechnician: true,
      },
      {
        nameJson: { ar: 'الأساسية — سنوي', en: 'Basic — Yearly' },
        descriptionJson: {
          ar: 'الباقة الأساسية لمدة سنة كاملة — شهران مجاناً',
          en: 'Basic for a full year — 2 months free',
        },
        interval: 'YEARLY',
        price: 1990,
        servicesPerMonth: 2,
        discountPercent: 10,
        priorityBooking: false,
        freeHomeService: false,
        dedicatedTechnician: false,
      },
      {
        nameJson: { ar: 'المميزة — سنوي', en: 'Premium — Yearly' },
        descriptionJson: {
          ar: 'الباقة المميزة لمدة سنة كاملة — شهران مجاناً',
          en: 'Premium for a full year — 2 months free',
        },
        interval: 'YEARLY',
        price: 3990,
        servicesPerMonth: 3,
        discountPercent: 15,
        priorityBooking: true,
        freeHomeService: false,
        dedicatedTechnician: false,
      },
      {
        nameJson: { ar: 'الملكية — سنوي', en: 'VIP — Yearly' },
        descriptionJson: {
          ar: 'الباقة الملكية لمدة سنة كاملة — شهران مجاناً',
          en: 'VIP for a full year — 2 months free',
        },
        interval: 'YEARLY',
        price: 7990,
        servicesPerMonth: 8,
        discountPercent: 20,
        priorityBooking: true,
        freeHomeService: true,
        dedicatedTechnician: true,
      },
    ],
  });
  console.log(' 6 beauty subscription plans (Basic/Premium/VIP × monthly/yearly)');

  // Addresses for first customer
  const addr1 = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'المنزل',
      city: 'الرياض',
      area: 'الملز',
      street: 'شارع التحلية',
      lat: 24.7136,
      lng: 46.6753,
      isDefault: true,
    },
  });
  await prisma.address.createMany({
    data: [
      {
        userId: customers[1]!.id,
        label: 'المنزل',
        city: 'جدة',
        area: 'الروضة',
        street: 'طريق الملك',
        lat: 21.5433,
        lng: 39.1728,
        isDefault: true,
      },
      {
        userId: customers[2]!.id,
        label: 'المنزل',
        city: 'الدمام',
        area: 'الشاطئ',
        street: 'شارع الأمير',
        lat: 26.4207,
        lng: 50.0888,
        isDefault: true,
      },
      {
        userId: customers[3]!.id,
        label: 'العمل',
        city: 'الرياض',
        area: 'العليا',
        street: 'طريق الملك فهد',
        lat: 24.7136,
        lng: 46.6753,
        isDefault: true,
      },
      {
        userId: customers[4]!.id,
        label: 'المنزل',
        city: 'المدينة المنورة',
        area: 'قربان',
        street: 'شارع السلام',
        lat: 24.5247,
        lng: 39.5693,
        isDefault: true,
      },
      {
        userId: customers[5]!.id,
        label: 'المنزل',
        city: 'الخبر',
        area: 'الكورنيش',
        street: 'طريق الملك فهد',
        lat: 26.2867,
        lng: 50.2083,
        isDefault: true,
      },
    ],
  });
  console.log(' Customer address');

  // Bookings with various statuses
  const bookingStatuses: Array<{
    status: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
    daysAgo: number;
  }> = [
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
      console.log(`    Booking ${bs.status} skipped: ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(` ${bookingCount} bookings`);

  // Reviews
  let reviewCount = 0;
  const reviewComments = [
    'خدمة ممتازة وأنيقة!',
    'رائعة جداً، سأكرر التجربة',
    'محترفة ونظيفة، شكراً',
    'أفضل فنية جربتها',
  ];
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
    } catch {
      /* skip if booking reference missing */
    }
  }
  console.log(` ${reviewCount} reviews`);

  // Wallet transactions
  try {
    const customerWallet = await (prisma as any).wallet.findUnique({
      where: { userId: customer.id },
    });
    if (customerWallet) {
      await (prisma as any).walletTransaction.createMany({
        data: [
          {
            walletId: customerWallet.id,
            amount: 500,
            type: 'CREDIT',
            source: 'PLATFORM_FEE_SHARE',
            description: 'إيداع أولي',
            referenceId: 'topup_init',
          },
          {
            walletId: customerWallet.id,
            amount: 50,
            type: 'CREDIT',
            source: 'CASHBACK',
            description: 'كاش باك من الحجز',
            referenceId: 'booking_1',
          },
        ],
      });
      console.log(' Wallet transactions');
    }
  } catch (err: any) {
    console.log(`    Wallet tx: ${err.message?.slice(0, 60)}`);
  }

  // Reviews for completed bookings
  try {
    const reviewComments = [
      'خدمة ممتازة وأنيقة!',
      'رائعة جداً، سأكرر التجربة',
      'محترفة ونظيفة، شكراً',
      'أفضل فنية جربتها',
    ];
    let reviewCount = 0;
    const allBookings = await (prisma as any).booking.findMany({
      where: { status: 'COMPLETED' },
      take: 4,
    });
    for (let i = 0; i < allBookings.length; i++) {
      try {
        await (prisma as any).review.create({
          data: {
            bookingId: allBookings[i].id,
            customerId: allBookings[i].customerId,
            rating: 4 + (i % 2),
            comment: reviewComments[i]!,
          },
        });
        reviewCount++;
      } catch {
        /* skip if duplicate */
      }
    }
    if (reviewCount > 0) console.log(` ${reviewCount} reviews`);
  } catch (err: any) {
    console.log(`    Reviews: ${err.message?.slice(0, 60)}`);
  }

  // Loyalty, notifications, wishlist, flash deal
  try {
    await (prisma as any).loyaltyAccount.create({
      data: { userId: customer.id, points: 650, lifetimePoints: 1200, tier: 'GOLD' },
    });
    await (prisma as any).notification.createMany({
      data: [
        {
          userId: customer.id,
          titleJson: { ar: 'تم تأكيد حجزك', en: 'Your booking is confirmed' },
          bodyJson: {
            ar: 'تم قبول حجزك من قبل نورة العمري',
            en: 'Your booking was accepted by Noura Alomari',
          },
          type: 'booking_accepted',
          sentVia: ['in_app'],
          isRead: false,
        },
        {
          userId: customer.id,
          titleJson: { ar: 'عرض خاص', en: 'Special offer' },
          bodyJson: { ar: 'خصم ٢٠٪ على خدمات المساج', en: '20% off massage services' },
          type: 'promo',
          sentVia: ['in_app'],
          isRead: false,
        },
      ],
    });
    await (prisma as any).wishlistItem.createMany({
      data: [{ userId: customer.id, serviceId: services[3]!.id }],
    });
    await (prisma as any).flashDeal.create({
      data: {
        serviceId: services[0]!.id,
        titleAr: 'خصم ٤٠٪',
        discountPercent: 40,
        originalPrice: Number(services[0]!.basePrice),
        dealPrice: Number(services[0]!.basePrice) * 0.6,
        discountValue: Number(services[0]!.basePrice) * 0.4,
        maxRedemptions: 20,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 24 * 3600000),
        isActive: true,
      },
    });
    await (prisma as any).flashDeal.create({
      data: {
        serviceId: services[4]!.id,
        titleAr: 'خصم ٣٠٪ مكياج',
        discountPercent: 30,
        originalPrice: Number(services[4]!.basePrice),
        dealPrice: Number(services[4]!.basePrice) * 0.7,
        discountValue: Number(services[4]!.basePrice) * 0.3,
        maxRedemptions: 10,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 48 * 3600000),
        isActive: true,
      },
    });
    await (prisma as any).flashDeal.create({
      data: {
        serviceId: services[5]!.id,
        titleAr: 'خصم ٣٥٪ مساج',
        discountPercent: 35,
        originalPrice: Number(services[5]!.basePrice),
        dealPrice: Number(services[5]!.basePrice) * 0.65,
        discountValue: Number(services[5]!.basePrice) * 0.35,
        maxRedemptions: 15,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 12 * 3600000),
        isActive: true,
      },
    });
    console.log(' Loyalty, notifications, wishlist, flash deals');
  } catch (err: any) {
    console.log(`    Extra data: ${err.message?.slice(0, 60)}`);
  }

  // Promo codes
  try {
    await (prisma as any).promoCode.createMany({
      data: [
        {
          code: 'WELCOME20',
          discountType: 'percent',
          discountValue: 20,
          minOrderAmount: 100,
          maxUses: 100,
          currentUses: 12,
          isActive: true,
          validUntil: new Date(Date.now() + 30 * 86400000),
          createdBy: admin.id,
        },
        {
          code: 'FLASH50',
          discountType: 'percent',
          discountValue: 50,
          minOrderAmount: 200,
          maxUses: 50,
          currentUses: 45,
          isActive: true,
          validUntil: new Date(Date.now() + 7 * 86400000),
          createdBy: admin.id,
        },
        {
          code: 'SAVE50SAR',
          discountType: 'fixed',
          discountValue: 50,
          minOrderAmount: 150,
          maxUses: 200,
          currentUses: 87,
          isActive: true,
          validUntil: new Date(Date.now() + 60 * 86400000),
          createdBy: admin.id,
        },
        {
          code: 'EXPIRED10',
          discountType: 'percent',
          discountValue: 10,
          maxUses: 50,
          currentUses: 50,
          isActive: false,
          validUntil: new Date(Date.now() - 1 * 86400000),
          createdBy: admin.id,
        },
        {
          code: 'BIG100',
          discountType: 'fixed',
          discountValue: 100,
          minOrderAmount: 500,
          maxUses: 20,
          currentUses: 3,
          isActive: true,
          validUntil: new Date(Date.now() + 14 * 86400000),
          createdBy: admin.id,
        },
      ],
    });
    console.log(' 5 promo codes (active + expired)');
  } catch (err: any) {
    console.log(`    Promo codes: ${err.message?.slice(0, 700)}`);
  }

  // Gift cards
  try {
    await (prisma as any).giftCard.createMany({
      data: [
        {
          code: 'GIFT-2024-001',
          amount: 200,
          balance: 200,
          purchaserId: customer.id,
          recipientEmail: 'friend@test.com',
          recipientName: 'مها',
          message: 'هدية عيد ميلاد سعيد! ',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 365 * 86400000),
        },
        {
          code: 'GIFT-2024-002',
          amount: 100,
          balance: 0,
          purchaserId: customer.id,
          recipientEmail: 'sister@test.com',
          recipientName: 'ريم',
          message: 'لكِ مع حبي ',
          status: 'REDEEMED',
          expiresAt: new Date(Date.now() + 365 * 86400000),
        },
        {
          code: 'GIFT-2024-003',
          amount: 500,
          balance: 500,
          purchaserId: customers[1]!.id,
          recipientName: 'سارة',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 180 * 86400000),
        },
        {
          code: 'GIFT-2024-004',
          amount: 150,
          balance: 150,
          purchaserId: customers[2]!.id,
          recipientName: 'هند',
          message: 'شكراً لكِ ',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 90 * 86400000),
        },
        {
          code: 'GIFT-2024-005',
          amount: 300,
          balance: 75,
          purchaserId: customers[3]!.id,
          recipientName: 'لطيفة',
          message: 'عذراً على التأخير ',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 120 * 86400000),
        },
        {
          code: 'GIFT-2024-006',
          amount: 1000,
          balance: 1000,
          purchaserId: customers[0]!.id,
          recipientName: 'أمي الحبيبة',
          message: 'كل عام وأنتِ بألف خير ',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 365 * 86400000),
        },
      ],
    });
    console.log(' 3 gift cards (active + redeemed)');
  } catch (err: any) {
    console.log(`    Gift cards: ${err.message?.slice(0, 700)}`);
  }

  // ── Geo Promotions ──
  try {
    await db.geoPromotion.createMany({
      data: [
        {
          titleJson: { ar: 'خصم ٣٠٪ على العناية بالبشرة', en: '30% off Skincare' },
          descriptionJson: {
            ar: 'خصم خاص لسكان الرياض على جميع خدمات العناية بالبشرة',
            en: 'Special discount for Riyadh residents on all skincare services',
          },
          city: 'الرياض',
          lat: 24.7136,
          lng: 46.6753,
          radiusKm: 10,
          discountPct: 30,
          maxDiscount: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 14 * 86400000),
          isActive: true,
          createdBy: admin.id,
        },
        {
          titleJson: { ar: 'خصم ٢٥٪ على المساج', en: '25% off Massage' },
          descriptionJson: {
            ar: 'استمتعي بجلسة مساج استرخائي بخصم ٢٥٪ في جدة',
            en: 'Enjoy a relaxation massage with 25% off in Jeddah',
          },
          city: 'جدة',
          lat: 21.5433,
          lng: 39.1728,
          radiusKm: 8,
          discountPct: 25,
          maxDiscount: 80,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 10 * 86400000),
          isActive: true,
          createdBy: admin.id,
        },
        {
          titleJson: { ar: 'خصم ٤٠٪ للطلب الأول', en: '40% off First Order' },
          descriptionJson: {
            ar: 'خصم ترحيبي للعميلات الجدد في جميع المدن',
            en: 'Welcome discount for new customers in all cities',
          },
          city: 'الرياض',
          lat: 24.7136,
          lng: 46.6753,
          radiusKm: 50,
          discountPct: 40,
          maxDiscount: 150,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 86400000),
          isActive: true,
          createdBy: admin.id,
        },
        {
          titleJson: { ar: 'عرض نهاية الأسبوع', en: 'Weekend Special' },
          descriptionJson: {
            ar: 'خصم ٢٠٪ على جميع خدمات التجميل في عطلة نهاية الأسبوع',
            en: '20% off all beauty services during the weekend',
          },
          city: 'الدمام',
          lat: 26.4207,
          lng: 50.0888,
          radiusKm: 15,
          discountPct: 20,
          maxDiscount: 60,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 86400000),
          isActive: true,
          createdBy: admin.id,
        },
        {
          titleJson: { ar: 'عرض الصيف الحار', en: 'Hot Summer Deal' },
          descriptionJson: {
            ar: 'خصم ١٥٪ على خدمات العناية بالشعر والأظافر',
            en: '15% off hair and nail care services',
          },
          city: 'جدة',
          lat: 21.5433,
          lng: 39.1728,
          radiusKm: 20,
          discountPct: 15,
          maxDiscount: 50,
          startsAt: new Date(Date.now() + 7 * 86400000),
          endsAt: new Date(Date.now() + 45 * 86400000),
          isActive: true,
          createdBy: admin.id,
        },
      ],
    });
    console.log(' 5 geo promotions');
  } catch (err: any) {
    console.log(`    Geo promotions: ${err.message?.slice(0, 60)}`);
  }

  // ── Live Streams ──
  try {
    await db.liveStream.createMany({
      data: [
        {
          technicianId: technicians[0]!.user.id,
          titleJson: { ar: 'جلسة مكياج سهرة مباشرة', en: 'Live Evening Makeup Session' },
          descriptionJson: {
            ar: 'تعلمي أساسيات مكياج السهرات مع نورة',
            en: 'Learn evening makeup basics with Noura',
          },
          category: 'makeup',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 2 * 86400000),
          isFeatured: true,
        },
        {
          technicianId: technicians[1]?.user.id ?? customer.id,
          titleJson: { ar: 'أسرار العناية بالشعر', en: 'Hair Care Secrets' },
          descriptionJson: {
            ar: 'اكتشفي أفضل الطرق للعناية بشعرك',
            en: 'Discover the best ways to care for your hair',
          },
          category: 'hair',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 4 * 86400000),
          isFeatured: true,
        },
        {
          technicianId: technicians[2]?.user.id ?? customer.id,
          titleJson: { ar: 'روتين العناية بالبشرة', en: 'Skincare Routine' },
          descriptionJson: {
            ar: 'روتين يومي للعناية بالبشرة مع د. ليلى',
            en: 'Daily skincare routine with Dr. Laila',
          },
          category: 'skincare',
          status: 'LIVE',
          streamUrl: 'https://youtube.com/embed/example1',
          scheduledAt: new Date(Date.now() - 3600000),
          startedAt: new Date(Date.now() - 3600000),
          viewerCount: 234,
          isFeatured: true,
        },
        {
          technicianId: technicians[0]!.user.id,
          titleJson: { ar: 'فن الأظافر الاحترافي', en: 'Professional Nail Art' },
          descriptionJson: {
            ar: 'تعلمي أحدث صيحات الأظافر',
            en: 'Learn the latest nail art trends',
          },
          category: 'nails',
          status: 'ENDED',
          scheduledAt: new Date(Date.now() - 7 * 86400000),
          startedAt: new Date(Date.now() - 7 * 86400000),
          endedAt: new Date(Date.now() - 7 * 86400000 + 3600000),
          recordingUrl: 'https://youtube.com/watch?v=example',
          viewerCount: 1520,
        },
        {
          technicianId: technicians[1]?.user.id ?? customer.id,
          titleJson: { ar: 'تسريحات شعر للمناسبات', en: 'Occasion Hairstyles' },
          descriptionJson: {
            ar: 'تسريحات شعر راقية للمناسبات الخاصة',
            en: 'Elegant hairstyles for special occasions',
          },
          category: 'hair',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 5 * 86400000),
        },
      ],
    });
    console.log(' 5 live streams');
  } catch (err: any) {
    console.log(`    Live streams: ${err.message?.slice(0, 60)}`);
  }

  // ── Beauty Bundles ──
  try {
    await db.beautyBundle.createMany({
      data: [
        {
          titleJson: { ar: 'باقة العروس', en: 'Bridal Package' },
          descriptionJson: {
            ar: 'مكياج عرايس + تسريحة شعر + حناء نقش — كل ما تحتاجينه ليومكِ الكبير',
            en: 'Bridal makeup + hairstyling + henna art',
          },
          serviceIds: [5, 1, 7],
          discountPct: 20,
          totalPrice: 840,
          originalPrice: 1050,
          season: 'WEDDING',
          isSeasonal: true,
          sortOrder: 1,
        },
        {
          titleJson: { ar: 'باقة يوم السبا', en: 'Spa Day Package' },
          descriptionJson: {
            ar: 'تنظيف بشرة + مساج استرخائي + مانيكير جل — يوم كامل من العناية',
            en: 'Facial + massage + gel manicure',
          },
          serviceIds: [4, 6, 3],
          discountPct: 15,
          totalPrice: 383,
          originalPrice: 450,
          sortOrder: 2,
        },
        {
          titleJson: { ar: 'باقة التجديد السريع', en: 'Quick Refresh' },
          descriptionJson: {
            ar: 'قص شعر + مانيكير جل — تجديد سريع في ساعة ونصف',
            en: 'Haircut + gel manicure',
          },
          serviceIds: [1, 3],
          discountPct: 10,
          totalPrice: 162,
          originalPrice: 180,
          sortOrder: 3,
        },
        {
          titleJson: { ar: 'باقة العيد', en: 'Eid Glam Package' },
          descriptionJson: {
            ar: 'صبغ شعر + مكياج + حناء — إطلالة متكاملة للعيد',
            en: 'Hair color + makeup + henna',
          },
          serviceIds: [2, 5, 7],
          discountPct: 15,
          totalPrice: 910,
          originalPrice: 1070,
          season: 'EID',
          isSeasonal: true,
          sortOrder: 4,
        },
        // Women-only life event bundles (Phase W2)
        {
          titleJson: { ar: 'باقة أول تجربة', en: 'First Beauty Experience' },
          descriptionJson: {
            ar: 'باقة خاصة للمراهقات: تنظيف بشرة لطيف + مانيكير + استشارة عناية',
            en: 'Teen-friendly: gentle facial + manicure + beauty consultation',
          },
          serviceIds: [9, 3],
          discountPct: 25,
          totalPrice: 180,
          originalPrice: 240,
          season: 'TEEN',
          isSeasonal: true,
          sortOrder: 5,
        },
        {
          titleJson: { ar: 'باقة الأمومة', en: 'Mommy Refresh' },
          descriptionJson: {
            ar: 'للأمهات الجدد: مساج استرخائي + تنظيف بشرة سريع + عناية بالشعر',
            en: 'New moms: relaxation massage + express facial + hair care',
          },
          serviceIds: [6, 9, 1],
          discountPct: 20,
          totalPrice: 360,
          originalPrice: 450,
          season: 'MOTHER',
          isSeasonal: true,
          sortOrder: 6,
        },
        {
          titleJson: { ar: 'باقة الساعة الذهبية', en: 'Golden Hour Package' },
          descriptionJson: {
            ar: 'للسيدات ٥٥+: مساج لطيف + عناية بالبشرة + مانيكير — مع شاي وتمر',
            en: '55+ ladies: gentle massage + skincare + manicure — with tea & dates',
          },
          serviceIds: [6, 4, 3],
          discountPct: 25,
          totalPrice: 338,
          originalPrice: 450,
          season: 'GOLDEN',
          isSeasonal: true,
          sortOrder: 7,
        },
      ],
    });
    console.log(' 7 beauty bundles');
  } catch (err: any) {
    console.log(`    Bundles: ${err.message?.slice(0, 60)}`);
  }

  // ── Beauty Subscription Plans ──
  try {
    await db.beautyPlan.createMany({
      data: [
        {
          nameJson: { ar: 'الباقة الأساسية', en: 'Basic Plan' },
          descriptionJson: {
            ar: 'خدمتان شهرياً + خصم ١٠٪ على الخدمات الإضافية',
            en: '2 services/month + 10% off additional',
          },
          priceMonthly: 199,
          priceAnnual: 1990,
          maxBookings: 2,
          discountPct: 10,
          features: ['priority_booking'],
          sortOrder: 1,
        },
        {
          nameJson: { ar: 'الباقة المميزة', en: 'Premium Plan' },
          descriptionJson: {
            ar: '٤ خدمات شهرياً + خصم ١٥٪ + أولوية الحجز',
            en: '4 services/month + 15% off + priority booking',
          },
          priceMonthly: 399,
          priceAnnual: 3990,
          maxBookings: 4,
          discountPct: 15,
          features: ['priority_booking', 'free_home_service'],
          sortOrder: 2,
        },
        {
          nameJson: { ar: 'الباقة الشاملة', en: 'VIP Plan' },
          descriptionJson: {
            ar: '٨ خدمات شهرياً + خصم ٢٠٪ + فنية مخصصة + خدمة منزلية مجانية',
            en: '8 services/month + 20% off + dedicated tech + free home service',
          },
          priceMonthly: 799,
          priceAnnual: 7990,
          maxBookings: 8,
          discountPct: 20,
          features: ['priority_booking', 'free_home_service', 'dedicated_tech'],
          sortOrder: 3,
        },
      ],
    });
    console.log(' 3 beauty subscription plans');
  } catch (err: any) {
    console.log(`    Plans: ${err.message?.slice(0, 60)}`);
  }

  // ---- Feature flags (experimental features, toggled via featureFlags router) ----
  // Seeded enabled so the gated routers behave as they did pre-gating.
  // Ops can flip any flag at runtime through the admin featureFlags.upsert.
  try {
    const FEATURE_FLAGS = [
      { key: 'ENABLE_SKIN_ANALYSIS', name: 'Skin Analysis' },
      { key: 'ENABLE_VIRTUAL_TRYON', name: 'Virtual Try-On' },
      { key: 'ENABLE_AI_CHAT', name: 'AI Chat (Beauty Galaxy)' },
      { key: 'ENABLE_PRODUCT_SCANNER', name: 'Product Scanner' },
      { key: 'ENABLE_PREDICTIVE_DEMAND', name: 'Predictive Demand' },
      { key: 'ENABLE_BEAUTY_TRENDS', name: 'Beauty Trends' },
      { key: 'ENABLE_BEAUTY_INNOVATION', name: 'Beauty Innovation' },
      { key: 'ENABLE_SECRET_SANTA', name: 'Secret Santa' },
      { key: 'ENABLE_TIME_CAPSULE', name: 'Time Capsule' },
      { key: 'ENABLE_CONCIERGE', name: 'Concierge' },
      { key: 'ENABLE_BRIDAL_CONCIERGE', name: 'Bridal Concierge' },
      { key: 'ENABLE_BEAUTY_METAVERSE', name: 'Beauty Metaverse' },
      { key: 'ENABLE_BEAUTY_BINGO', name: 'Beauty Bingo' },
    ] as const;

    await prisma.featureFlag.createMany({
      data: FEATURE_FLAGS.map((f) => ({
        key: f.key,
        name: f.name,
        enabled: true,
        rolloutPercent: 100,
      })),
      skipDuplicates: true,
    });
    console.log(` ${FEATURE_FLAGS.length} feature flags`);
  } catch (err: any) {
    console.log(`    Feature flags: ${err.message?.slice(0, 60)}`);
  }

  // ---- Product marketplace categories (B.3: vendor products need a home) ----
  // 'general' is the fallback category for vendor-added products.
  try {
    const PRODUCT_CATEGORIES = [
      { nameJson: { ar: 'عام', en: 'General' }, slug: 'general', sortOrder: 0 },
      {
        nameJson: { ar: 'العناية بالبشرة', en: 'Skincare' },
        slug: 'product-skincare',
        sortOrder: 1,
      },
      {
        nameJson: { ar: 'العناية بالشعر', en: 'Hair Care' },
        slug: 'product-haircare',
        sortOrder: 2,
      },
      { nameJson: { ar: 'المكياج', en: 'Makeup' }, slug: 'product-makeup', sortOrder: 3 },
      { nameJson: { ar: 'العطور', en: 'Fragrance' }, slug: 'product-fragrance', sortOrder: 4 },
    ] as const;

    await prisma.productCategory.createMany({
      data: PRODUCT_CATEGORIES.map((c) => ({ ...c })),
      skipDuplicates: true,
    });
    console.log(` ${PRODUCT_CATEGORIES.length} product categories`);
  } catch (err: any) {
    console.log(`    Product categories: ${err.message?.slice(0, 60)}`);
  }

  // ---- 3.1 Beauty DNA demo products (skin/hair/fragrance match data) ----
  // Attributes use the polymorphic payload discriminated by `kind`:
  // makeup { shade, shadeHex, undertone, depth } | fragrance { fragranceFamily, seasons }.
  try {
    const demoVendorUser = await prisma.user.create({
      data: {
        email: 'demo-store@galaxyofbeauty.sa',
        phone: '+966599000001',
        passwordHash: customerPasswordHash,
        name: 'متجر جالاكسي التجريبي',
        role: 'CUSTOMER',
        emailVerified: true,
        preferredLanguage: 'ar',
      },
    });

    const demoVendor = await prisma.vendor.create({
      data: {
        userId: demoVendorUser.id,
        storeName: 'Galaxy Demo Store',
        storeSlug: 'galaxy-demo-store',
        descriptionJson: {
          ar: 'متجر تجريبي لمنتجات البصمة الجمالية (3.1)',
          en: 'Beauty DNA 3.1 demo products',
        },
        type: 'VENDOR',
        licenseNumber: 'DEMO-3.1',
        isVerified: true,
        isActive: true,
        commissionRate: 10,
      },
    });

    const [makeupCat, fragranceCat] = await Promise.all([
      prisma.productCategory.findUniqueOrThrow({ where: { slug: 'product-makeup' } }),
      prisma.productCategory.findUniqueOrThrow({ where: { slug: 'product-fragrance' } }),
    ]);

    const FOUNDATIONS = [
      {
        shade: 'porcelain',
        shadeHex: '#F6E3D0',
        undertone: 'cool',
        depth: 1,
        ar: 'بورسلين',
        en: 'Porcelain',
      },
      {
        shade: 'ivory',
        shadeHex: '#F3DCC4',
        undertone: 'neutral',
        depth: 1,
        ar: 'عاجي',
        en: 'Ivory',
      },
      { shade: 'sand', shadeHex: '#EAC9A8', undertone: 'warm', depth: 2, ar: 'رملي', en: 'Sand' },
      { shade: 'beige', shadeHex: '#DDB58C', undertone: 'warm', depth: 3, ar: 'بيج', en: 'Beige' },
      {
        shade: 'golden',
        shadeHex: '#C89B67',
        undertone: 'neutral',
        depth: 4,
        ar: 'ذهبي',
        en: 'Golden',
      },
      { shade: 'mocha', shadeHex: '#A87A4C', undertone: 'warm', depth: 5, ar: 'موكا', en: 'Mocha' },
      {
        shade: 'espresso',
        shadeHex: '#7C5330',
        undertone: 'neutral',
        depth: 6,
        ar: 'إسبريسو',
        en: 'Espresso',
      },
    ] as const;

    const makeupProducts = FOUNDATIONS.map((f) => ({
      vendorId: demoVendor.id,
      categoryId: makeupCat.id,
      nameJson: { ar: `كريم أساس سيلك ${f.ar}`, en: `Silk Foundation ${f.en}` },
      descriptionJson: {
        ar: `كريم أساس بدرجة ${f.ar} بعمق ${f.depth} من 6 — أساس ساتان يدوم 12 ساعة.`,
        en: `Foundation shade ${f.en}, depth ${f.depth}/6 — a 12-hour satin base.`,
      },
      price: 129,
      stock: 100,
      brand: 'Galaxy Beauty Lab',
      emoji: '🧴',
      tags: ['foundation', 'long-wear'] as string[],
      attributes: {
        kind: 'makeup',
        shade: f.shade,
        shadeHex: f.shadeHex,
        undertone: f.undertone,
        depth: f.depth,
      } as unknown as Prisma.InputJsonValue,
      images: [] as string[],
    }));

    const CONCEALERS = [
      { shade: 'light', shadeHex: '#F0D9C0', undertone: 'cool', depth: 2, ar: 'فاتح', en: 'Light' },
      { shade: 'deep', shadeHex: '#9A6B45', undertone: 'warm', depth: 5, ar: 'داكن', en: 'Deep' },
    ] as const;

    const concealerProducts = CONCEALERS.map((c) => ({
      vendorId: demoVendor.id,
      categoryId: makeupCat.id,
      nameJson: { ar: `كونسيلر إخفاء ${c.ar}`, en: `Conceal Perfect ${c.en}` },
      descriptionJson: {
        ar: `كونسيلر بدرجة ${c.ar} يغطي الهالات ويصحح البقع.`,
        en: `Concealer shade ${c.en} covering dark circles and spots.`,
      },
      price: 89,
      stock: 100,
      brand: 'Galaxy Beauty Lab',
      emoji: '🧴',
      tags: ['concealer'] as string[],
      images: [] as string[],
      attributes: {
        kind: 'makeup',
        shade: c.shade,
        shadeHex: c.shadeHex,
        undertone: c.undertone,
        depth: c.depth,
      } as unknown as Prisma.InputJsonValue,
    }));

    const PERFUMES = [
      {
        family: 'floral',
        seasons: ['spring', 'summer'],
        ar: 'وردة الطائف',
        en: 'Taif Rose',
        price: 249,
        emoji: '🌸',
      },
      {
        family: 'citrus',
        seasons: ['summer', 'spring'],
        ar: 'برتقال جدة',
        en: 'Jeddah Citrus',
        price: 219,
        emoji: '🍋',
      },
      {
        family: 'fresh',
        seasons: ['summer', 'spring'],
        ar: 'نسيم الصباح',
        en: 'Morning Breeze',
        price: 199,
        emoji: '🌿',
      },
      {
        family: 'woody',
        seasons: ['autumn', 'winter'],
        ar: 'عود الرياض',
        en: 'Riyadh Oud',
        price: 289,
        emoji: '🪵',
      },
      {
        family: 'oriental',
        seasons: ['winter', 'autumn'],
        ar: 'عنبر الشرق',
        en: 'Amber Orient',
        price: 349,
        emoji: '✨',
      },
      {
        family: 'sweet',
        seasons: ['winter', 'autumn'],
        ar: 'فانيليا',
        en: 'Vanilla Dream',
        price: 269,
        emoji: '🍬',
      },
    ] as const;

    const fragranceProducts = PERFUMES.map((p) => ({
      vendorId: demoVendor.id,
      categoryId: fragranceCat.id,
      nameJson: { ar: `عطر ${p.ar}`, en: `${p.en} Eau de Parfum` },
      descriptionJson: {
        ar: `عطر بلمسة ${p.ar} يناسب الأجواء الباردة والدافئة حسب الموسم.`,
        en: `A ${p.family} fragrance suited to its seasons.`,
      },
      price: p.price,
      stock: 80,
      brand: 'Galaxy Beauty Lab',
      emoji: p.emoji,
      tags: ['perfume', p.family] as string[],
      images: [] as string[],
      attributes: {
        kind: 'fragrance',
        fragranceFamily: p.family,
        seasons: p.seasons,
      } as unknown as Prisma.InputJsonValue,
    }));

    await prisma.product.createMany({
      data: [...makeupProducts, ...concealerProducts, ...fragranceProducts],
    });
    console.log(' 3.1 Beauty DNA demo store: 9 makeup + 6 fragrance products');
  } catch (err: any) {
    console.log(`    Demo products: ${err.message?.slice(0, 60)}`);
  }

  // ---- 2.5 Social Commerce demo posts (shoppable feed) ----
  try {
    // demoVendor lives inside the 3.1 try block — re-resolve by slug.
    const postsVendor = await prisma.vendor.findUnique({
      where: { storeSlug: 'galaxy-demo-store' },
    });
    const postProducts = postsVendor
      ? await prisma.product.findMany({
          where: { vendorId: postsVendor.id },
          orderBy: { id: 'asc' },
          take: 6,
        })
      : [];
    const perfume = await prisma.product.findFirst({
      where: { category: { slug: 'product-fragrance' } },
      orderBy: { id: 'asc' },
    });
    const [foundation] = postProducts;
    const makeupService = services[0];
    const facialService = services[1] ?? services[0];

    const POSTS = [
      {
        authorId: technicians[0]!.user.id, // verified technician
        imageUrl:
          'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop',
        caption: 'إطلالة السهرة كاملة — كريم أساس سيلك مع مكياج خفيف ✨ #MyGalaxyLook',
        tags: {
          products: [foundation?.id].filter(Boolean),
          services: [makeupService?.id].filter(Boolean),
        },
        featured: true,
      },
      {
        authorId: customer.id,
        imageUrl:
          'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&auto=format&fit=crop',
        caption: 'روتيني الصباحي مع الأساس الجديد — نتيجة رائعة من أول استخدام 💕',
        tags: {
          products: [postProducts[2]?.id].filter(Boolean),
          services: [facialService?.id].filter(Boolean),
        },
        featured: true,
      },
      {
        authorId: customer.id,
        imageUrl:
          'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop',
        caption: 'عطر ورد الطائف من متجر جالاكسي — ثبات يدوم طوال اليوم 🌸',
        tags: { products: [perfume?.id].filter(Boolean), services: [] },
        featured: false,
      },
      {
        authorId: technicians[1]?.user.id ?? technicians[0]!.user.id,
        imageUrl:
          'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&auto=format&fit=crop',
        caption: 'نتيجة جلسة العناية اليوم — إشراقة طبيعية بدون فلتر 💆‍♀️',
        tags: { products: [], services: [facialService?.id].filter(Boolean) },
        featured: false,
      },
    ] as const;

    const createdPosts = [];
    for (const p of POSTS) {
      const post = await prisma.beautyPost.create({
        data: {
          userId: p.authorId,
          imageUrl: p.imageUrl,
          caption: p.caption,
          tagsJson: p.tags as unknown as Prisma.InputJsonValue,
          featured: p.featured,
        },
      });
      createdPosts.push(post);
    }
    await prisma.beautyPostLike.createMany({
      data: [
        { postId: createdPosts[0]!.id, userId: customer.id },
        { postId: createdPosts[1]!.id, userId: technicians[0]!.user.id },
      ],
    });
    await prisma.beautyPost.updateMany({
      where: { id: { in: [createdPosts[0]!.id, createdPosts[1]!.id] } },
      data: { likes: 1 },
    });
    await prisma.beautyPostComment.create({
      data: { postId: createdPosts[0]!.id, userId: customer.id, content: 'إطلالة رائعة! 😍' },
    });
    console.log(' 2.5 Social commerce: 4 demo posts (2 featured)');
  } catch (err: any) {
    console.log(`    Demo posts: ${err.message?.slice(0, 60)}`);
  }

  // ---- Notification templates (B.26 framework) ----
  // Rendered by lib/notify.ts with {{placeholder}} interpolation; category
  // maps to the notificationPreference toggle of the same name.
  try {
    const NOTIFICATION_TEMPLATES = [
      {
        key: 'booking_created',
        category: 'bookingReminders',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'تم استلام طلب الحجز', en: 'Booking Request Received' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، تم استلام طلب حجزك لخدمة {{serviceName}}. سنخبرك فور تأكيده.',
          en: 'Hi {{customerName}}, your booking request for {{serviceName}} has been received. We will notify you once it is confirmed.',
        },
      },
      {
        key: 'booking_accepted',
        category: 'bookingReminders',
        channels: ['in_app', 'push', 'sms'],
        titleJson: { ar: 'تم تأكيد حجزك', en: 'Your Booking is Confirmed' },
        bodyJson: {
          ar: 'ممتاز {{customerName}}! تم تأكيد حجزك لخدمة {{serviceName}} مع {{techName}} بتاريخ {{date}} الساعة {{time}}.',
          en: 'Great news {{customerName}}! Your {{serviceName}} booking with {{techName}} is confirmed for {{date}} at {{time}}.',
        },
      },
      {
        key: 'booking_reminder',
        category: 'bookingReminders',
        channels: ['in_app', 'push', 'whatsapp'],
        titleJson: { ar: 'تذكير بموعدك', en: 'Upcoming Appointment Reminder' },
        bodyJson: {
          ar: 'تذكير: موعدك لخدمة {{serviceName}} بتاريخ {{date}} الساعة {{time}}. نراكم قريبًا!',
          en: 'Reminder: your {{serviceName}} appointment is on {{date}} at {{time}}. See you soon!',
        },
      },
      {
        key: 'booking_request_tech',
        category: 'bookingReminders',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'طلب حجز جديد', en: 'New Booking Request' },
        bodyJson: {
          ar: 'لديك طلب حجز جديد لخدمة {{serviceName}} من {{customerName}} بتاريخ {{date}} الساعة {{time}}.',
          en: 'New booking request for {{serviceName}} from {{customerName}} on {{date}} at {{time}}.',
        },
      },
      {
        key: 'booking_followup',
        category: 'tips',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'كيف كانت خدمتك؟', en: 'How Was Your Service?' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، نتمنى أن تكون خدمة {{serviceName}} نالت إعجابك. شاركينا تقييمك واحجزي جلستك القادمة!',
          en: 'Hi {{customerName}}, we hope you enjoyed your {{serviceName}} session. Share your review and book your next visit!',
        },
      },
      // 3.3 Proactive AI advisor — one in-app insight per user per week.
      {
        key: 'advisor_insight',
        category: 'tips',
        channels: ['in_app'],
        titleJson: { ar: 'توصية ذكية لكِ', en: 'A smart tip for you' },
        bodyJson: { ar: '{{insightTextAr}}', en: '{{insightTextEn}}' },
      },
      // 2.2 Beauty Subscription — 3-day renewal reminder.
      {
        key: 'subscription_renewal_reminder',
        category: 'bookingReminders',
        channels: ['in_app', 'push', 'whatsapp'],
        titleJson: { ar: 'تجديد اشتراكك قريب', en: 'Your Subscription Renews Soon' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، سيتم تجديد باقة {{planName}} خلال ٣ أيام بسعر {{price}} ر.س. يمكنك الإيقاف من صفحة الاشتراكات.',
          en: 'Hi {{customerName}}, your {{planName}} plan renews in 3 days at {{price}} SAR. You can pause it anytime from your subscriptions page.',
        },
      },
      {
        key: 'loyalty_nudge',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'نقاطك تناديك', en: 'Your Points Are Waiting' },
        bodyJson: {
          ar: '{{customerName}}، باقي {{pointsNeeded}} نقطة فقط لتصلي إلى مستوى {{nextTier}}!',
          en: '{{customerName}}, only {{pointsNeeded}} points to reach {{nextTier}} tier!',
        },
      },
      // 8.2 — loyalty points expiry heads-up (30 days).
      {
        key: 'loyalty_points_expiring',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'نقاطك على وشك الانتهاء', en: 'Your Points Expire Soon' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، ستنتهي صلاحية {{points}} نقطة بتاريخ {{date}}. استخدميها قبل فوات الأوان!',
          en: 'Hi {{customerName}}, {{points}} points expire on {{date}}. Use them before they are gone!',
        },
      },
      // 8.3 — welcome series (day 0 at signup, 1/3/7 via the daily sweep).
      {
        key: 'welcome_day0',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'أهلًا بكِ في مجرة الجمال', en: 'Welcome to Galaxy of Beauty' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}! اكتشفي عالمكِ الجمالي — خدمات، مجتمع، ومكافآت بانتظارك.',
          en: 'Welcome {{customerName}}! Your beauty world awaits — services, community, and rewards.',
        },
      },
      {
        key: 'welcome_day1',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'ابدئي رحلتكِ', en: 'Start Your Journey' },
        bodyJson: {
          ar: '{{customerName}}، تصفحي آلاف خدمات التجميل واختاري ما يناسبك.',
          en: '{{customerName}}, browse thousands of beauty services and pick what fits you.',
        },
      },
      {
        key: 'welcome_day3',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'متجر الجمال بانتظاركِ', en: 'The Beauty Store Awaits' },
        bodyJson: {
          ar: '{{customerName}}، منتجات تجميل أصلية وخصومات حصرية في متجر الجمال.',
          en: '{{customerName}}, authentic beauty products and exclusive deals in the store.',
        },
      },
      {
        key: 'welcome_day7',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'احجزي أول موعدكِ', en: 'Book Your First Visit' },
        bodyJson: {
          ar: '{{customerName}}، جاهزة لأول موعد؟ احجزي الآن واكسبي نقاط ولاء من أول زيارة.',
          en: '{{customerName}}, ready for your first visit? Book now and earn loyalty points from day one.',
        },
      },
      // 8.3b — 30-day inactivity re-engagement.
      {
        key: 'reengagement_30d',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'اشتقنا لكِ', en: 'We Miss You' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، مرّت فترة منذ زيارتك الأخيرة! احجزي الآن واحصلي على إضافة مجانية مع موعدك.',
          en: 'Hi {{customerName}}, it has been a while since your last visit! Book now and get a free add-on with your appointment.',
        },
      },
      // 8.3c — abandoned cart (24h + 10% code).
      {
        key: 'cart_abandoned',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'سلتك بانتظارك', en: 'Your Cart Is Waiting' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، تركتِ منتجات في سلتك! أكملي طلبك بكود {{code}} واحصلي على خصم {{discount}}٪ (صالحة ٢٤ ساعة).',
          en: 'Hi {{customerName}}, you left items in your cart! Complete your order with code {{code}} for {{discount}}% off (valid 24 hours).',
        },
      },
      // 8.3d — post-booking review request (2–26h after the appointment).
      {
        key: 'post_booking_review',
        category: 'bookingReminders',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'كيف كانت تجربتك؟', en: 'How Was Your Experience?' },
        bodyJson: {
          ar: 'أهلًا {{customerName}}، نتمنى أن تكون تجربتك رائعة! قيّمي زيارتك وساعدينا نخدمكِ أفضل — وموعدك القادم بانتظارك.',
          en: 'Hi {{customerName}}, we hope your visit was lovely! Rate it and help us serve you better — your next appointment awaits.',
        },
      },
      // 8.3e — birthday (20% off; the sweep also creates the yearly reward).
      {
        key: 'birthday',
        category: 'promotions',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'عيد ميلاد سعيد!', en: 'Happy Birthday!' },
        bodyJson: {
          ar: 'كل عام وأنتِ بخير {{customerName}}! 🎂 هديتنا لكِ: خصم {{discount}}٪ على حجزك القادم — متاح في صفحة مكافآت عيد الميلاد.',
          en: 'Happy birthday {{customerName}}! 🎂 Our gift: {{discount}}% off your next booking — available on your birthday rewards page.',
        },
      },
      // B.6/B.7 — provider submission decisions. Category 'provider' is not
      // a preference toggle → always delivered.
      {
        key: 'submission_approved',
        category: 'provider',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'تمت الموافقة على طلبك', en: 'Your Submission Was Approved' },
        bodyJson: {
          ar: 'تهانينا {{providerName}}! تمت الموافقة على {{subjectName}} من قبل فريق جالكسي بيوتي.',
          en: 'Congratulations {{providerName}}! Your {{subjectName}} was approved by the Galaxy of Beauty team.',
        },
      },
      {
        key: 'submission_rejected',
        category: 'provider',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'تم رفض طلبك', en: 'Your Submission Was Rejected' },
        bodyJson: {
          ar: 'عذرًا {{providerName}}، تم رفض {{subjectName}}.{{reason}}',
          en: 'Sorry {{providerName}}, your {{subjectName}} was rejected.{{reason}}',
        },
      },
      // 4.3 — detractor alert for admins. Category 'admin' is not a
      // preference toggle → always delivered.
      {
        key: 'nps_detractor',
        category: 'admin',
        channels: ['in_app', 'push'],
        titleJson: {
          ar: 'تقييم منخفض — متابعة خلال 24 ساعة',
          en: 'Detractor NPS — follow up within 24h',
        },
        bodyJson: {
          ar: 'تقييم {{score}}/10{{comment}}. الحجز {{bookingId}} — تابعي العميلة خلال 24 ساعة.',
          en: 'Score {{score}}/10{{comment}}. Booking {{bookingId}} — follow up with the customer within 24h.',
        },
      },
      // E2 — clinic consultation decisions. Category 'provider' is not a
      // preference toggle → always delivered.
      {
        key: 'consultation_confirmed',
        category: 'provider',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'تم تأكيد استشارتك', en: 'Your Consultation Is Confirmed' },
        bodyJson: {
          ar: 'أكدت {{clinicName}} استشارتك {{when}} (رقم الحجز: {{code}}). نراكِ قريباً!',
          en: '{{clinicName}} confirmed your consultation on {{when}} (code: {{code}}). See you soon!',
        },
      },
      {
        key: 'consultation_cancelled',
        category: 'provider',
        channels: ['in_app', 'push'],
        titleJson: { ar: 'تم إلغاء استشارتك', en: 'Your Consultation Was Cancelled' },
        bodyJson: {
          ar: 'عذرًا، ألغت {{clinicName}} استشارتك {{when}} (رقم الحجز: {{code}}). يمكنك حجز موعد آخر.',
          en: 'Sorry, {{clinicName}} cancelled your consultation on {{when}} (code: {{code}}). You can book another slot.',
        },
      },
    ] as const;

    await prisma.notificationTemplate.createMany({
      data: NOTIFICATION_TEMPLATES.map((t) => ({ ...t })),
      skipDuplicates: true,
    });
    console.log(` ${NOTIFICATION_TEMPLATES.length} notification templates`);
  } catch (err: any) {
    console.log(`    Notification templates: ${err.message?.slice(0, 60)}`);
  }

  // ---- Daily beauty tips + beauty quiz (feed the mobile public screens) ----
  try {
    await db.dailyBeautyTip.createMany({
      data: [
        { emoji: '💧', tip: 'اشربي 8 أكواب ماء يومياً لبشرة نضرة', category: 'عناية' },
        { emoji: '🧴', tip: 'لا تنسي واقي الشمس حتى في الأيام الغائمة', category: 'حماية' },
        { emoji: '😴', tip: 'النوم 7-8 ساعات هو سر البشرة المتوهجة', category: 'عناية' },
        { emoji: '💆', tip: 'دلكي وجهك بحركات دائرية لتنشيط الدورة الدموية', category: 'تدليك' },
        { emoji: '🍊', tip: 'فيتامين C صباحاً لبشرة مشرقة طوال اليوم', category: 'تغذية' },
        { emoji: '🚿', tip: 'استخدمي ماء فاتراً بدلاً من الساخن لغسل الوجه', category: 'عناية' },
        { emoji: '🌿', tip: 'ماسك الطين مرة أسبوعياً لتنظيف المسام', category: 'عناية' },
        { emoji: '💄', tip: 'أزيلي المكياج دائماً قبل النوم مهما كنتِ متعبة', category: 'عناية' },
      ],
    });
    await db.beautyQuizQuestion.createMany({
      data: [
        {
          question: 'ما هو نوع بشرتكِ؟',
          optionsJson: ['جافة', 'دهنية', 'مختلطة', 'حساسة'],
          correctIndex: 0,
          explanation: 'كل نوع يحتاج روتيناً مختلفاً',
        },
        {
          question: 'كم مرة تستخدمين واقي الشمس؟',
          optionsJson: ['يومياً', 'أحياناً', 'أبداً'],
          correctIndex: 0,
          explanation: 'الوقاية اليومية أساس العناية',
        },
        {
          question: 'ما هي أهم خطوة في الروتين المسائي؟',
          optionsJson: ['إزالة المكياج', 'الترطيب', 'التقشير'],
          correctIndex: 0,
          explanation: 'النوم بمكياج يسبب انسداد المسام',
        },
        {
          question: 'متى يكون أفضل وقت لتطبيق السيروم؟',
          optionsJson: ['بعد التنظيف وقبل الترطيب', 'بعد الترطيب', 'قبل النوم فقط'],
          correctIndex: 0,
          explanation: 'السيروم يخترق البشرة النظيفة أفضل',
        },
        {
          question: 'كم ساعة نوم تحتاجينها لبشرة صحية؟',
          optionsJson: ['7-8 ساعات', '5-6 ساعات', '4 ساعات'],
          correctIndex: 0,
          explanation: 'النوم الكافي يعزز تجدد الخلايا',
        },
      ],
    });
    console.log(' Daily tips + beauty quiz questions');
  } catch (err: any) {
    console.log(`    Tips/quiz: ${err.message?.slice(0, 60)}`);
  }

  // ---- E6d — trust badges: flag the spa/wellness catalog as women-only
  // with private suites (modesty-first demo data).
  try {
    await prisma.service.updateMany({
      where: { category: { slug: 'spa-wellness' } },
      data: { isWomenOnlyStaff: true, isPrivateSuite: true },
    });
    console.log(' Trust badges: spa-wellness flagged women-only + private suite');
  } catch (err: any) {
    console.log(`    Trust badges: ${err.message?.slice(0, 60)}`);
  }

  // ---- 1.3 Add-Ons Marketplace — popular pairings ("customers who booked
  // this also added"). The core `services` array carries no slugs, so link
  // by index: 0 haircut, 1 hair color, 2 manicure, 3 facial, 4 bridal
  // makeup, 6 henna, 7 blow-dry, 8 deep conditioning, 9 express facial,
  // 10 makeup trial. Popularity drives the getById addon order.
  try {
    const link = async (
      mainIdx: number,
      addonIdx: number,
      popularityScore: number,
      isSuggested = false,
      bundleDiscountPercent = 0,
    ) => {
      const main = services[mainIdx];
      const addon = services[addonIdx];
      if (!main || !addon) return false;
      await prisma.serviceAddon.upsert({
        where: { serviceId_addonId: { serviceId: main.id, addonId: addon.id } },
        create: {
          serviceId: main.id,
          addonId: addon.id,
          popularityScore,
          isSuggested,
          bundleDiscountPercent,
        },
        update: { popularityScore, isSuggested, bundleDiscountPercent },
      });
      return true;
    };

    let linked = 0;
    linked += (await link(0, 7, 95, true, 15)) ? 1 : 0; // haircut + blow-dry
    linked += (await link(0, 8, 40)) ? 1 : 0; // haircut + deep conditioning
    linked += (await link(2, 6, 88, true, 10)) ? 1 : 0; // manicure + henna art
    linked += (await link(1, 8, 82, true, 15)) ? 1 : 0; // hair color + deep conditioning
    linked += (await link(4, 10, 75, true, 20)) ? 1 : 0; // bridal makeup + trial
    linked += (await link(3, 9, 70)) ? 1 : 0; // facial + express facial
    console.log(` Add-on marketplace: ${linked} popular pairings linked`);
  } catch (err: any) {
    console.log(`    Add-on links: ${err.message?.slice(0, 60)}`);
  }

  // ---- E7 — beauty shorts (persisted media, pre-approved for the demo) ----
  const SAMPLE_VIDEOS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  ];
  const SHORT_SEEDS = [
    {
      type: 'reel',
      titleJson: { ar: 'طريقة تطبيق الآيلاينر بسهولة', en: 'Easy eyeliner application' },
      videoUrl: SAMPLE_VIDEOS[0],
      durationSec: 32,
      views: 5200,
      category: 'makeup',
      isApproved: true,
    },
    {
      type: 'reel',
      titleJson: { ar: 'روتين عناية بالبشرة في دقيقة', en: 'One-minute skincare routine' },
      videoUrl: SAMPLE_VIDEOS[1],
      durationSec: 45,
      views: 3800,
      category: 'skincare',
      isApproved: true,
    },
    {
      type: 'reel',
      titleJson: { ar: 'تسريحة شعر سريعة للمناسبات', en: 'Quick event hairstyle' },
      durationSec: 28,
      views: 4100,
      category: 'hair',
      isApproved: true,
    },
    {
      type: 'reel',
      titleJson: { ar: 'مانيكير في ٣٠ ثانية', en: 'Manicure in 30 seconds' },
      durationSec: 35,
      views: 2900,
      category: 'nails',
      isApproved: true,
    },
    {
      type: 'before_after',
      titleJson: { ar: 'نتيجة صبغ الشعر البلاتيني', en: 'Platinum hair color result' },
      beforeImageUrl: null,
      durationSec: 0,
      views: 1200,
      category: 'hair',
      isApproved: true,
      consentGiven: true,
    },
    {
      type: 'before_after',
      titleJson: { ar: 'علاج حب الشباب — بعد ٣ جلسات', en: 'Acne treatment — after 3 sessions' },
      beforeImageUrl: null,
      durationSec: 0,
      views: 2100,
      category: 'skincare',
      isApproved: true,
      consentGiven: true,
    },
  ];
  try {
    await prisma.short.createMany({ data: SHORT_SEEDS });
    console.log(` ${SHORT_SEEDS.length} beauty shorts`);
  } catch (err: any) {
    console.log(`    Shorts: ${err.message?.slice(0, 60)}`);
  }

  console.log('\n Seed complete! Test login: customer@test.com / Admin@123456\n');
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
