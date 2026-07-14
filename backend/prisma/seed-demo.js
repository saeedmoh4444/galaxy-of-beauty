/**
 * Demo Seed — populates the database with realistic sample data
 * for development, testing, and demonstrations.
 *
 * Usage: node prisma/seed-demo.js
 *
 * Creates:
 *   - 2 sample customers
 *   - 3 sample technicians (different cities, KYC statuses)
 *   - Wallet entries for all users
 *   - Availability slots for technicians (next 7 days)
 *   - A few bookings in various states (REQUESTED, ACCEPTED, COMPLETED)
 *   - Sample reviews
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD = 'Demo@123456';

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // Ensure base seed has been run (check for admin user)
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@galaxyofbeauty.sa' } });
  if (!adminExists) {
    console.log('⚠️  Base seed not found. Running base seed first...\n');
    const { default: baseSeed } = await import('./seed.js');
    // The base seed exports a main function via side-effect. Just run it inline.
    const bcrypt = (await import('bcrypt')).default;
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    await prisma.user.upsert({
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
    console.log('✅ Base admin created. Please run `npm run prisma:seed` for full catalog data.\n');
  }

  // Check services exist
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    console.log('⚠️  No services found. Please run `npm run prisma:seed` first for catalog data.');
    console.log('   Demo bookings will be skipped.\n');
  }

  // ---- Clean existing demo data ----
  await prisma.booking.deleteMany({ where: { bookingCode: { startsWith: 'DEMO-' } } });
  await prisma.availabilitySlot.deleteMany({ where: { technician: { user: { email: { contains: 'demo' } } } } });
  await prisma.walletTransaction.deleteMany({ where: { wallet: { user: { email: { contains: 'demo' } } } } });
  await prisma.wallet.deleteMany({ where: { user: { email: { contains: 'demo' } } } });
  await prisma.technician.deleteMany({ where: { user: { email: { contains: 'demo' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'demo' } } });

  const hash = await bcrypt.hash(PASSWORD, 12);

  // ---- Customers ----
  const sara = await prisma.user.create({
    data: {
      email: 'sara.demo@example.com',
      phone: '+966512345678',
      name: 'سارة أحمد',
      passwordHash: hash,
      role: 'CUSTOMER',
      emailVerified: true,
      phoneVerified: true,
      wallet: { create: { balance: 150, bonusBalance: 0 } },
      addresses: {
        create: [
          { label: 'المنزل', city: 'الرياض', area: 'حي النرجس', street: 'شارع الأمير محمد بن سلمان', isDefault: true },
          { label: 'العمل', city: 'الرياض', area: 'حي العليا', street: 'طريق الملك فهد' },
        ],
      },
    },
    include: { wallet: true, addresses: true },
  });

  const noura = await prisma.user.create({
    data: {
      email: 'noura.demo@example.com',
      phone: '+966598765432',
      name: 'نورة محمد',
      passwordHash: hash,
      role: 'CUSTOMER',
      emailVerified: true,
      wallet: { create: { balance: 80, bonusBalance: 50 } },
      addresses: {
        create: [
          { label: 'المنزل', city: 'جدة', area: 'حي الروضة', street: 'شارع صاري', isDefault: true },
        ],
      },
    },
    include: { wallet: true, addresses: true },
  });

  console.log('✅ Customers created: سارة, نورة');

  // ---- Technicians ----
  const layla = await prisma.user.create({
    data: {
      email: 'layla.demo@example.com',
      phone: '+966555111222',
      name: 'ليلى العمري',
      passwordHash: hash,
      role: 'TECHNICIAN',
      emailVerified: true,
      wallet: { create: { balance: 450, bonusBalance: 0 } },
    },
    include: { wallet: true },
  });

  const fatima = await prisma.user.create({
    data: {
      email: 'fatima.demo@example.com',
      phone: '+966555333444',
      name: 'فاطمة الحربي',
      passwordHash: hash,
      role: 'TECHNICIAN',
      emailVerified: true,
      wallet: { create: { balance: 620, bonusBalance: 50 } },
    },
    include: { wallet: true },
  });

  const huda = await prisma.user.create({
    data: {
      email: 'huda.demo@example.com',
      phone: '+966555666777',
      name: 'هدى الشمري',
      passwordHash: hash,
      role: 'TECHNICIAN',
      emailVerified: true,
      wallet: { create: { balance: 210, bonusBalance: 0 } },
    },
    include: { wallet: true },
  });

  // Technician profiles
  const laylaProfile = await prisma.technician.create({
    data: {
      userId: layla.id,
      city: 'الرياض',
      area: 'حي النرجس',
      bioJson: { ar: 'خبيرة تجميل بخبرة 7 سنوات. متخصصة في الشعر والمكياج.', en: 'Beauty expert with 7 years experience. Specialized in hair and makeup.' },
      hourlyRate: 200,
      ratingAvg: 4.8,
      totalReviews: 24,
      completedBookings: 89,
      kycStatus: 'VERIFIED',
      kycDocuments: [{ type: 'id_front', url: '/uploads/kyc/demo-id-front.jpg' }],
    },
  });

  const fatimaProfile = await prisma.technician.create({
    data: {
      userId: fatima.id,
      city: 'جدة',
      area: 'حي الروضة',
      bioJson: { ar: 'أخصائية عناية بالبشرة والأظافر. حاصلة على شهادة دولية.', en: 'Skincare and nail specialist. Internationally certified.' },
      hourlyRate: 180,
      ratingAvg: 4.9,
      totalReviews: 31,
      completedBookings: 112,
      kycStatus: 'VERIFIED',
    },
  });

  const hudaProfile = await prisma.technician.create({
    data: {
      userId: huda.id,
      city: 'الدمام',
      area: 'حي الشاطئ',
      bioJson: { ar: 'متخصصة مساج وعناية بالجسم. خبرة 5 سنوات في المنتجعات.', en: 'Massage and body care specialist. 5 years spa experience.' },
      hourlyRate: 160,
      ratingAvg: 4.6,
      totalReviews: 15,
      completedBookings: 45,
      kycStatus: 'VERIFIED',
    },
  });

  console.log('✅ Technicians created: ليلى, فاطمة, هدى');

  // ---- Map technicians to services ----
  const services = await prisma.service.findMany({ take: 10 });
  const techProfiles = [laylaProfile, fatimaProfile, hudaProfile];

  for (const tech of techProfiles) {
    // Each technician offers 4-6 random services
    const shuffled = [...services].sort(() => Math.random() - 0.5).slice(0, 5);
    for (const svc of shuffled) {
      await prisma.technicianService.upsert({
        where: { technicianId_serviceId: { technicianId: tech.id, serviceId: svc.id } },
        create: {
          technicianId: tech.id,
          serviceId: svc.id,
          customPrice: Math.round(Number(svc.basePrice) * (0.9 + Math.random() * 0.3)),
          isActive: true,
        },
        update: { isActive: true },
      });
    }
  }
  console.log('✅ Technician services mapped');

  // ---- Availability Slots (next 7 days) ----
  const now = new Date();
  const slots = [];

  for (const tech of [laylaProfile, fatimaProfile, hudaProfile]) {
    for (let day = 1; day <= 7; day++) {
      const slotDate = new Date(now);
      slotDate.setDate(slotDate.getDate() + day);
      slotDate.setHours(0, 0, 0, 0);

      // Morning slots: 9:00, 10:00, 11:00
      for (let hour = 9; hour <= 11; hour++) {
        const startAt = new Date(slotDate);
        startAt.setHours(hour, 0, 0, 0);
        const endAt = new Date(startAt);
        endAt.setHours(hour + 1, 0, 0, 0);

        slots.push({
          technicianId: tech.id,
          startAt,
          endAt,
          isBooked: false,
          isAvailable: true,
        });
      }

      // Afternoon slots: 14:00, 15:00, 16:00
      for (let hour = 14; hour <= 16; hour++) {
        const startAt = new Date(slotDate);
        startAt.setHours(hour, 0, 0, 0);
        const endAt = new Date(startAt);
        endAt.setHours(hour + 1, 0, 0, 0);

        slots.push({
          technicianId: tech.id,
          startAt,
          endAt,
          isBooked: false,
          isAvailable: true,
        });
      }
    }
  }

  await prisma.availabilitySlot.createMany({ data: slots });
  console.log(`✅ ${slots.length} availability slots created (7 days)`);

  // ---- Sample Bookings in various states ----
  if (serviceCount === 0) {
    console.log('⏭️  Skipping bookings — no services available.');
    console.log('\n🎉 Demo seed completed (partial — run prisma:seed first for full data)!\n');
    return;
  }

  const allSlots = await prisma.availabilitySlot.findMany({ orderBy: { startAt: 'asc' }, take: 20 });
  const laylaSlots = allSlots.filter((s) => s.technicianId === laylaProfile.id);
  const fatimaSlots = allSlots.filter((s) => s.technicianId === fatimaProfile.id);
  const hudaSlots = allSlots.filter((s) => s.technicianId === hudaProfile.id);

  const hairService = services.find((s) => s.titleJson?.ar?.includes('شعر') || s.titleJson?.ar?.includes('قص'));
  const makeupService = services.find((s) => s.titleJson?.ar?.includes('مكياج'));
  const skinService = services.find((s) => s.titleJson?.ar?.includes('بشرة'));
  const massageService = services.find((s) => s.titleJson?.ar?.includes('مساج'));

  // Booking 1: REQUESTED (waiting for tech to accept)
  if (laylaSlots[0]) {
    const slot = laylaSlots[0];
    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: true } });
      const booking = await tx.booking.create({
        data: {
          bookingCode: 'DEMO-REQ01',
          customerId: sara.id,
          technicianId: layla.id,
          serviceId: hairService?.id || services[0].id,
          addressId: sara.addresses[0].id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'REQUESTED',
          totalAmount: hairService?.basePrice || 80,
          platformFee: 11,
        },
      });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { bookingId: booking.id } });
    });
  }

  // Booking 2: COMPLETED (with review)
  if (fatimaSlots[1]) {
    const slot = fatimaSlots[1];
    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: true } });
      const booking = await tx.booking.create({
        data: {
          bookingCode: 'DEMO-COMP01',
          customerId: noura.id,
          technicianId: fatima.id,
          serviceId: skinService?.id || services[1].id,
          addressId: noura.addresses[0].id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'COMPLETED',
          totalAmount: skinService?.basePrice || 150,
          platformFee: 11,
          providerRevealed: true,
        },
      });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { bookingId: booking.id } });

      // Create payment record
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: skinService?.basePrice || 150,
          currency: 'SAR',
          intent: 'CAPTURE',
          status: 'CAPTURED',
        },
      });

      // Create review
      await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: noura.id,
          rating: 5,
          comment: 'خدمة رائعة! فاطمة محترفة جداً وأنيقة. أنصح بها بشدة.',
          isVisible: true,
        },
      });
    });
  }

  // Booking 3: ACCEPTED (waiting for payment)
  if (hudaSlots[0]) {
    const slot = hudaSlots[0];
    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: true } });
      const booking = await tx.booking.create({
        data: {
          bookingCode: 'DEMO-ACPT01',
          customerId: sara.id,
          technicianId: huda.id,
          serviceId: massageService?.id || services[2].id,
          addressId: sara.addresses[0].id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'ACCEPTED',
          totalAmount: massageService?.basePrice || 200,
          platformFee: 11,
          providerRevealed: true,
        },
      });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { bookingId: booking.id } });
    });
  }

  // Booking 4: COMPLETED (with review for layla)
  if (laylaSlots[2]) {
    const slot = laylaSlots[2];
    await prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: true } });
      const booking = await tx.booking.create({
        data: {
          bookingCode: 'DEMO-COMP02',
          customerId: noura.id,
          technicianId: layla.id,
          serviceId: makeupService?.id || services[3].id,
          addressId: noura.addresses[0].id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'COMPLETED',
          totalAmount: makeupService?.basePrice || 250,
          platformFee: 11,
          providerRevealed: true,
        },
      });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { bookingId: booking.id } });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: makeupService?.basePrice || 250,
          currency: 'SAR',
          intent: 'CAPTURE',
          status: 'CAPTURED',
        },
      });

      await tx.review.create({
        data: {
          bookingId: booking.id,
          customerId: noura.id,
          rating: 4,
          comment: 'مكياج جميل جداً. ليلى مبدعة في عملها.',
          isVisible: true,
        },
      });
    });
  }

  console.log('✅ Sample bookings created (REQUESTED, ACCEPTED, 2× COMPLETED with reviews)');

  // ---- Wallet Transactions for completed bookings ----
  await prisma.walletTransaction.create({
    data: {
      walletId: noura.wallet.id,
      type: 'CREDIT',
      source: 'CASHBACK',
      amount: 60,
      description: 'First booking cashback (40%)',
      referenceId: 'booking:DEMO-COMP01',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: noura.wallet.id,
      type: 'CREDIT',
      source: 'CASHBACK',
      amount: 12.5,
      description: 'Booking cashback (5%)',
      referenceId: 'booking:DEMO-COMP02',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: fatima.wallet.id,
      type: 'CREDIT',
      source: 'PLATFORM_FEE_SHARE',
      amount: 4.25,
      description: 'Earnings from booking #DEMO-COMP01',
      referenceId: 'booking:DEMO-COMP01',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: layla.wallet.id,
      type: 'CREDIT',
      source: 'PLATFORM_FEE_SHARE',
      amount: 5.25,
      description: 'Earnings from booking #DEMO-COMP02',
      referenceId: 'booking:DEMO-COMP02',
    },
  });

  console.log('✅ Wallet transactions created');

  // ---- Waitlist entries ----
  await prisma.waitlistEntry.create({
    data: {
      customerId: sara.id,
      technicianId: fatimaProfile.id,
      serviceId: skinService?.id,
      status: 'WAITING',
      position: 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Waitlist entry created');

  // ---- Summary ----
  console.log('\n🎉 Demo seed completed!');
  console.log('\n📋 Demo Accounts (password for all: Demo@123456):');
  console.log('   👩‍💼 Admin:    admin@galaxyofbeauty.sa');
  console.log('   👩 Customer: sara.demo@example.com    (سارة — الرياض)');
  console.log('   👩 Customer: noura.demo@example.com   (نورة — جدة)');
  console.log('   👩‍🎨 Tech:     layla.demo@example.com    (ليلى — الرياض، شعر ومكياج)');
  console.log('   👩‍🎨 Tech:     fatima.demo@example.com   (فاطمة — جدة، بشرة وأظافر)');
  console.log('   👩‍🎨 Tech:     huda.demo@example.com     (هدى — الدمام، مساج)');
  console.log('\n📅 Booking States:');
  console.log('   DEMO-REQ01  — REQUESTED  (سارة → ليلى، بانتظار القبول)');
  console.log('   DEMO-ACPT01 — ACCEPTED   (سارة → هدى، بانتظار الدفع)');
  console.log('   DEMO-COMP01 — COMPLETED  (نورة → فاطمة، مع تقييم ٥⭐)');
  console.log('   DEMO-COMP02 — COMPLETED  (نورة → ليلى، مع تقييم ٤⭐)');
}

main()
  .catch((e) => {
    console.error('Demo seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
