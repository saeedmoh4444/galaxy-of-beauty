/**
 * Worker job handlers — pure business logic, no BullMQ/Redis side effects.
 *
 * Extracted from index.ts (which creates BullMQ worker instances on
 * import) so tests can exercise the handlers directly without spawning
 * workers that poll Redis.
 */
import type { Job } from 'bullmq';
import { execFile } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { prisma } from '@galaxy/db';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  refreshGoogleToken,
} from '../lib/googleCalendar';
import { creditLoyaltyPoints } from '../lib/loyalty';
import { sendEmail, emailShell } from '../lib/email';
import { notifyUser } from '../lib/notify';
import { calculateVendorSettlements } from '../lib/storePayouts';
import { uploadFile } from '../lib/storage';

// ── Job type definitions ──

export interface CashbackJob {
  userId: number;
  bookingId: number;
  amount: number;
  idempotencyKey?: string;
}

export interface LoyaltyPointsJob {
  userId: number;
  bookingId: number;
  points: number;
  reason: string;
  idempotencyKey?: string;
}

export interface NotificationJob {
  userId: number;
  type: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  channels: string[]; // ['email', 'sms', 'push', 'in_app']
  link?: string;
  /** E2 — push deep-link payload (Expo notification content.data). */
  data?: Record<string, string>;
  idempotencyKey?: string;
  /** B.26: notifyUser() already created the in-app row — skip it here. */
  skipInApp?: boolean;
}

export interface CalendarSyncJob {
  /** Both sides are optional so one job can target one or both calendars. */
  technicianId?: number;
  customerId?: number;
  bookingId: number;
  /** 'delete' is a legacy alias of 'cancel' (kept for old queued jobs). */
  action: 'create' | 'update' | 'cancel' | 'delete';
  googleCalendarToken?: string;
  startAt?: string;
  endAt?: string;
  summary?: string;
  idempotencyKey?: string;
}

/** B.26 — delayed booking reminder (24h/48h before startAt). */
export interface BookingReminderJob {
  bookingId: number;
  date: string; // pre-formatted for the recipient locale
  time: string;
}

// ── Handlers ──

export async function handleWalletJob(job: Job<CashbackJob>): Promise<void> {
  const { userId, bookingId, amount } = job.data;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { bonusBalance: { increment: amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        source: 'CASHBACK',
        amount,
        description: `كاش باك من الحجز #${bookingId}`,
        referenceId: `booking_${bookingId}`,
        idempotencyKey: job.data.idempotencyKey ?? `cashback_${bookingId}`,
      },
    }),
  ]);
}

export async function handleLoyaltyJob(job: Job<LoyaltyPointsJob>): Promise<void> {
  const { userId, bookingId, points, reason } = job.data;

  // 8.2: one implementation for every earn path — booking points now ride
  // creditLoyaltyPoints too (expiry + boost windows apply).
  await creditLoyaltyPoints(prisma, userId, points, reason, `booking_${bookingId}`);
}

export async function handleNotificationJob(job: Job<NotificationJob>): Promise<void> {
  const { userId, type, titleAr, titleEn, bodyAr, bodyEn, channels } = job.data;

  // Legacy callers rely on this job to create the in-app row. B.26
  // notifyUser() creates the row itself and sets skipInApp on the job so
  // this handler only dispatches the external channels.
  if (!job.data.skipInApp) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        titleJson: { ar: titleAr, en: titleEn },
        bodyJson: { ar: bodyAr, en: bodyEn },
        sentVia: channels.length > 0 ? channels : ['in_app'],
      },
    });
  }

  // External channels — real dispatch (B.26). All senders are failure-
  // tolerant: unconfigured providers log and return, never throw.
  if (
    channels.includes('email') ||
    channels.includes('sms') ||
    channels.includes('push') ||
    channels.includes('whatsapp')
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, preferredLanguage: true },
    });
    if (!user) return;

    if (channels.includes('email') && user.email) {
      const { sendEmail, emailShell } = await import('../lib/email');
      await sendEmail({
        to: user.email,
        subject: titleEn,
        html: emailShell(
          `<h2 class="gob-text-strong">${titleEn}</h2><p class="gob-text-soft">${bodyEn}</p>`,
          'ltr',
        ),
      });
    }
    if (channels.includes('sms') && user.phone) {
      const { sendSms } = await import('../lib/sms');
      // Arabic-first for SMS (KSA audience); fall back to English title.
      await sendSms(user.phone, bodyAr || titleAr);
    }
    if (channels.includes('push')) {
      const { sendPushToUser } = await import('../lib/push');
      await sendPushToUser(userId, {
        title: user.preferredLanguage === 'en' ? titleEn : titleAr,
        body: user.preferredLanguage === 'en' ? bodyEn : bodyAr,
        data: job.data.data,
      });
    }
    // 6.5 WhatsApp — Cloud API when configured; silent no-op otherwise
    // (transport is failure-tolerant, like every other external sender).
    if (channels.includes('whatsapp') && user.phone) {
      const { sendWhatsAppText } = await import('../lib/whatsapp');
      await sendWhatsAppText(user.phone, bodyAr || titleAr);
    }
  }
}

/**
 * B.26 — render and deliver a booking reminder through the template
 * framework. Silent no-op if the booking was cancelled or completed since
 * the job was scheduled.
 */
export async function handleBookingReminderJob(job: Job<BookingReminderJob>): Promise<void> {
  const { bookingId, date, time } = job.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { titleJson: true } },
      customer: { select: { id: true, name: true, preferredLanguage: true } },
    },
  });
  if (!booking || !['REQUESTED', 'ACCEPTED', 'PAID', 'IN_PROGRESS'].includes(booking.status)) {
    return;
  }

  const { notifyUser } = await import('../lib/notify');
  const title = booking.service.titleJson as { ar: string; en: string };
  await notifyUser({
    userId: booking.customerId,
    templateKey: 'booking_reminder',
    vars: {
      customerName: booking.customer.name,
      serviceName:
        booking.customer.preferredLanguage === 'en' ? (title.en ?? '') : (title.ar ?? ''),
      date,
      time,
    },
    link: `/bookings/${booking.id}`,
  });
}

/**
 * Job-name dispatcher for the gob-notifications queue. 'notification.send'
 * (and legacy names) → handleNotificationJob; 'booking.reminder' →
 * handleBookingReminderJob.
 */
export async function dispatchNotificationJob(job: Job): Promise<void> {
  if (job.name === 'booking.reminder') {
    return handleBookingReminderJob(job as Job<BookingReminderJob>);
  }
  return handleNotificationJob(job as Job<NotificationJob>);
}

/**
 * Booking auto-sync (E9 follow-up) — push booking lifecycle events to the
 * connected Google Calendars of BOTH sides (customer first, then
 * technician). Fully graceful: any missing integration or Google failure
 * is logged and swallowed so a calendar outage can never break the
 * booking flow (the BullMQ retry would only duplicate events anyway —
 * event ids are persisted exactly once on success).
 */
export async function handleIntegrationJob(job: Job<CalendarSyncJob>): Promise<void> {
  const { technicianId, customerId, bookingId, action, startAt, endAt, summary } = job.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: { select: { titleJson: true } } },
  });
  if (!booking) {
    console.log(`[Integration] Calendar ${action} skipped — booking #${bookingId} not found`);
    return;
  }

  const serviceTitle =
    ((booking.service?.titleJson as Record<string, string> | null)?.ar ?? '') || 'حجز';
  const event = {
    summary: summary ?? `💅 ${serviceTitle} — ${booking.bookingCode}`,
    description: 'حجز من منصة جالكسي بيوتي — Galaxy of Beauty booking',
    start: startAt ?? booking.startAt.toISOString(),
    end: endAt ?? booking.endAt.toISOString(),
  };

  const sides: Array<{
    userId?: number;
    eventIdColumn: 'googleEventId' | 'technicianGoogleEventId';
  }> = [
    { userId: customerId, eventIdColumn: 'googleEventId' },
    { userId: technicianId, eventIdColumn: 'technicianGoogleEventId' },
  ];

  for (const side of sides) {
    if (!side.userId) continue;
    try {
      await syncSideToCalendar(side.userId, side.eventIdColumn, bookingId, action, event);
    } catch (err) {
      console.log(`[Integration] Calendar ${action} failed for user #${side.userId}:`, err);
    }
  }
}

async function syncSideToCalendar(
  userId: number,
  eventIdColumn: 'googleEventId' | 'technicianGoogleEventId',
  bookingId: number,
  action: CalendarSyncJob['action'],
  event: { summary: string; description: string; start: string; end: string },
): Promise<void> {
  const integration = await prisma.beautyIntegration.findUnique({
    where: { userId_provider: { userId, provider: 'google_calendar' } },
  });
  if (!integration || integration.status !== 'CONNECTED' || !integration.accessToken) {
    return; // not connected — nothing to do
  }

  // Refresh the token when it is (almost) expired; a failed refresh or a
  // missing refresh token means this side is skipped this cycle.
  let accessToken = integration.accessToken;
  if (integration.tokenExpiry && integration.tokenExpiry.getTime() < Date.now() + 60_000) {
    if (!integration.refreshToken) return;
    const refreshed = await refreshGoogleToken(integration.refreshToken);
    if (!refreshed) {
      console.log(`[Integration] Calendar token refresh failed for user #${userId}`);
      return;
    }
    accessToken = refreshed.accessToken;
    await prisma.beautyIntegration.update({
      where: { id: integration.id },
      data: { accessToken, tokenExpiry: new Date(refreshed.expiryDate) },
    });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { [eventIdColumn]: true } as never,
  });
  const eventId = (booking as Record<string, string | null> | null)?.[eventIdColumn];

  if (action === 'cancel' || action === 'delete') {
    if (eventId) {
      await deleteGoogleCalendarEvent(accessToken, eventId);
      await prisma.booking.update({
        where: { id: bookingId },
        data: { [eventIdColumn]: null } as never,
      });
    }
    return;
  }

  if (eventId && action === 'update') {
    const ok = await updateGoogleCalendarEvent(accessToken, eventId, event);
    if (!ok) {
      console.log(`[Integration] Calendar update failed for user #${userId}, event ${eventId}`);
    }
    return;
  }

  const createdId = await createGoogleCalendarEvent(accessToken, event);
  if (createdId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { [eventIdColumn]: createdId } as never,
    });
  } else {
    console.log(`[Integration] Calendar create failed for user #${userId}, booking #${bookingId}`);
  }
}

// ── C5 — bulk CSV product import (vendor portal) ─────────────────────────

export interface CsvImportJob {
  vendorId: number;
  userId: number;
  csv: string;
  idempotencyKey?: string;
}

export interface CsvImportReport {
  totalRows: number;
  imported: number;
  errors: { row: number; message: string }[];
}

/**
 * Minimal RFC4180-ish CSV parser: quoted fields, escaped quotes (""), and
 * CRLF/LF rows. No multiline fields — the import template never needs them
 * and this keeps the parser dependency-free (the audit gate dislikes new
 * deps).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

/**
 * handleCsvImportJob — C5: parse a vendor's uploaded CSV, validate every
 * row (nameAr required, price ≥ 1, non-negative integer stock, in-file
 * duplicate names) and create DRAFT products (isDraft: true — nothing
 * goes live from an import without the vendor reviewing it). The report
 * (imported + per-row errors) is the job's returnvalue, polled by
 * vendorPortal.importStatus.
 */
export async function handleCsvImportJob(job: Job<CsvImportJob>): Promise<CsvImportReport> {
  const { vendorId, csv } = job.data;

  const rows = parseCsv(csv.trim());
  const header = rows[0] ?? [];
  const expected = ['nameAr', 'nameEn', 'price', 'stock', 'emoji'];
  const headerOk = expected.every((h, i) => header[i]?.trim().toLowerCase() === h.toLowerCase());
  if (!headerOk) {
    return {
      totalRows: 0,
      imported: 0,
      errors: [{ row: 0, message: 'CSV header must be: nameAr,nameEn,price,stock,emoji' }],
    };
  }
  const body = rows.slice(1);
  if (body.length === 0) {
    return { totalRows: 0, imported: 0, errors: [{ row: 0, message: 'CSV has no data rows' }] };
  }

  const general = await prisma.productCategory.findUnique({ where: { slug: 'general' } });
  const anyCat =
    general ?? (await prisma.productCategory.findFirst({ orderBy: { sortOrder: 'asc' } }));
  if (!anyCat) {
    return {
      totalRows: body.length,
      imported: 0,
      errors: [{ row: 0, message: 'No product categories available' }],
    };
  }

  const errors: CsvImportReport['errors'] = [];
  const seenNames = new Set<string>();
  let imported = 0;

  for (let idx = 0; idx < body.length; idx++) {
    const rowNo = idx + 2; // 1-based; the header is row 1
    const [nameArRaw, nameEnRaw, priceRaw, stockRaw, emojiRaw] = body[idx] ?? [];
    const name = (nameArRaw ?? '').trim();
    if (!name) {
      errors.push({ row: rowNo, message: 'nameAr is required' });
      continue;
    }
    if (seenNames.has(name)) {
      errors.push({ row: rowNo, message: `Duplicate nameAr: ${name}` });
      continue;
    }
    seenNames.add(name);

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 1) {
      errors.push({ row: rowNo, message: 'price must be a number ≥ 1' });
      continue;
    }
    const stockRawStr = (stockRaw ?? '').trim();
    const stock = stockRawStr === '' ? 10 : Number(stockRawStr);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push({ row: rowNo, message: 'stock must be a non-negative integer' });
      continue;
    }

    await prisma.product.create({
      data: {
        vendorId,
        categoryId: anyCat.id,
        nameJson: { ar: name, en: (nameEnRaw ?? '').trim() || name },
        descriptionJson: { ar: '', en: '' },
        price,
        stock,
        sales: 0,
        emoji: (emojiRaw ?? '').trim(),
        isActive: true,
        isDraft: true, // C5 — imports land as drafts for vendor review
      },
    });
    imported++;
  }

  return { totalRows: body.length, imported, errors };
}

// ── D1 — vendor analytics read-model materialization ───────────────────────

export interface DailyStatsJob {
  /** KSA business date (YYYY-MM-DD) to materialize; defaults to yesterday. */
  date?: string;
}

/**
 * NOON-UTC discipline (memory rule): a KSA business day runs 12:00 UTC →
 * 12:00 UTC (15:00 KSA). Shift the instant back 12h and truncate, so every
 * order maps to a single calendar bucket date at 00:00 UTC.
 */
export function noonUtcDay(input: string | Date): Date {
  const d =
    typeof input === 'string'
      ? new Date(`${input}T12:00:00Z`)
      : new Date(input.getTime() - 12 * 3600_000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function yesterdayKsa(): string {
  return noonUtcDay(new Date()).toISOString().slice(0, 10);
}

/**
 * handleDailyStatsJob — D1: materialize one KSA business day's read-model
 * rows (revenue, orders, AOV, new-vs-returning customers, per-product
 * sales) for every vendor with FULFILLED orders in the bucket. Upserts on
 * (vendorId, day) so re-runs and backfills are idempotent.
 */
export async function handleDailyStatsJob(job: Job<DailyStatsJob>): Promise<{
  vendors: number;
  rows: number;
}> {
  const day = noonUtcDay(job.data.date ?? yesterdayKsa());
  // The bucket window is noon → noon UTC (the shifted KSA day): an order
  // at 10:00Z belongs to the PREVIOUS bucket, one at 14:00Z to this one.
  const windowStart = new Date(day.getTime() + 12 * 3600_000);
  const windowEnd = new Date(windowStart.getTime() + 24 * 3600_000);

  const orders = await prisma.storeOrder.findMany({
    where: { status: 'FULFILLED', createdAt: { gte: windowStart, lt: windowEnd } },
    include: { items: true },
  });

  const byVendor = new Map<number, typeof orders>();
  for (const o of orders) {
    const list = byVendor.get(o.vendorId) ?? [];
    list.push(o);
    byVendor.set(o.vendorId, list);
  }

  let rows = 0;
  for (const [vendorId, vendorOrders] of byVendor) {
    const revenue = vendorOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const customers = new Set(vendorOrders.map((o) => o.customerId));

    let newCustomers = 0;
    let returningCustomers = 0;
    for (const customerId of customers) {
      const earlier = await prisma.storeOrder.findFirst({
        where: { customerId, status: 'FULFILLED', createdAt: { lt: day } },
        select: { id: true },
      });
      if (earlier) returningCustomers++;
      else newCustomers++;
    }

    const prodMap = new Map<
      number,
      { productId: number; nameAr: string; quantity: number; revenue: number }
    >();
    for (const o of vendorOrders) {
      for (const it of o.items) {
        const cur = prodMap.get(it.productId) ?? {
          productId: it.productId,
          nameAr: (it.nameSnapshot as { ar?: string }).ar ?? '',
          quantity: 0,
          revenue: 0,
        };
        cur.quantity += it.quantity;
        cur.revenue += Number(it.priceSnapshot) * it.quantity;
        prodMap.set(it.productId, cur);
      }
    }

    const productSales = [...prodMap.values()];
    const aov = revenue / vendorOrders.length;

    // Q3 Phase 3 — reel conversion attribution: an order is reel-attributed
    // when its customer tapped a shoppable tag on the ordered product
    // within the 7-day window BEFORE the order. Per-reel buckets feed the
    // ReelDailyStat read-model the portal ranks reels by.
    const ATTRIBUTION_WINDOW_MS = 7 * 86_400_000;
    let reelOrders = 0;
    let reelRevenue = 0;
    const reelByShort = new Map<number, { orders: number; revenue: number }>();
    for (const o of vendorOrders) {
      const orderedProductIds = [...new Set(o.items.map((it) => it.productId))];
      if (orderedProductIds.length === 0) continue;
      const click = await prisma.shortTagClick.findFirst({
        where: {
          userId: o.customerId,
          productId: { in: orderedProductIds },
          clickedAt: {
            gte: new Date(o.createdAt.getTime() - ATTRIBUTION_WINDOW_MS),
            lte: o.createdAt,
          },
        },
        orderBy: { clickedAt: 'asc' },
        select: { shortId: true, productId: true },
      });
      if (!click) continue;
      const line = o.items.find((it) => it.productId === click.productId);
      const lineRevenue = line ? Number(line.priceSnapshot) * line.quantity : Number(o.totalAmount);
      reelOrders += 1;
      reelRevenue += lineRevenue;
      const cur = reelByShort.get(click.shortId) ?? { orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += lineRevenue;
      reelByShort.set(click.shortId, cur);
    }

    await prisma.vendorDailyStat.upsert({
      where: { vendorId_day: { vendorId, day } },
      create: {
        vendorId,
        day,
        revenue,
        orders: vendorOrders.length,
        aov,
        newCustomers,
        returningCustomers,
        productSales,
        reelOrders,
        reelRevenue,
      },
      update: {
        revenue,
        orders: vendorOrders.length,
        aov,
        newCustomers,
        returningCustomers,
        productSales,
        reelOrders,
        reelRevenue,
      },
    });
    for (const [shortId, agg] of reelByShort) {
      await prisma.reelDailyStat.upsert({
        where: { shortId_day: { shortId, day } },
        create: { shortId, day, orders: agg.orders, revenue: agg.revenue },
        update: { orders: agg.orders, revenue: agg.revenue },
      });
    }
    rows++;
  }

  return { vendors: byVendor.size, rows };
}

// ── D3 — AI store advisor: weekly digest materialization ───────────────────

export interface AdvisorDigestJob {
  /** Scope to one vendor (tests/backfills); undefined = every store. */
  vendorId?: number;
}

/**
 * handleAdvisorDigestJob — D3: run the rule engine over every store (or
 * one vendor) and drop an in-app notification for stores with at least
 * one rule, so the advisor surfaces without the vendor visiting the
 * portal. F2 adds the email channel: a bilingual weekly performance
 * digest (7-day revenue/orders from the D1 read model, top product,
 * low-stock count, top advisor rules) to the store owner. sendEmail
 * degrades to log-only when SMTP is unconfigured.
 */
export async function handleAdvisorDigestJob(job: Job<AdvisorDigestJob>): Promise<{
  notified: number;
  rules: number;
  emailed: number;
}> {
  const vendors = await prisma.vendor.findMany({
    where: {
      type: { in: ['STORE', 'VENDOR'] },
      ...(job.data.vendorId ? { id: job.data.vendorId } : {}),
    },
    select: { id: true, userId: true },
  });

  let notified = 0;
  let totalRules = 0;
  let emailed = 0;

  for (const vendor of vendors) {
    const rules = await advisorRulesForVendor(vendor.id);

    // F2 — weekly performance snapshot for the email channel.
    const [stats7, topProduct, lowStockCount, owner] = await Promise.all([
      prisma.vendorDailyStat.aggregate({
        where: { vendorId: vendor.id, day: { gte: new Date(Date.now() - 7 * 86_400_000) } },
        _sum: { revenue: true, orders: true },
      }),
      prisma.product.findFirst({
        where: { vendorId: vendor.id, isActive: true },
        orderBy: { sales: 'desc' },
        select: { nameJson: true },
      }),
      prisma.product.count({
        where: {
          vendorId: vendor.id,
          isActive: true,
          stock: { lte: prisma.product.fields.lowStockThreshold },
        },
      }),
      prisma.user.findUnique({
        where: { id: vendor.userId },
        select: { email: true, preferredLanguage: true },
      }),
    ]);
    const revenue7 = Number(stats7._sum.revenue ?? 0);
    const orders7 = stats7._sum.orders ?? 0;

    // Nothing to say at all — skip entirely.
    if (rules.length === 0 && revenue7 === 0 && orders7 === 0) continue;

    if (rules.length > 0) {
      await prisma.notification.create({
        data: {
          userId: vendor.userId,
          type: 'advisor_digest',
          titleJson: { ar: 'نصائح متجرك الأسبوعية', en: 'Your weekly store advisor' },
          bodyJson: {
            ar: rules
              .map((r) => r.params?.name ?? '')
              .filter(Boolean)
              .slice(0, 3)
              .join('، '),
            en: rules
              .map((r) => r.params?.name ?? '')
              .filter(Boolean)
              .slice(0, 3)
              .join(', '),
          },
          link: '/store?tab=overview',
          sentVia: ['in_app'],
        },
      });
      notified++;
      totalRules += rules.length;
    }

    // F2 — email the performance digest (SMTP-less environments log only).
    if (owner?.email) {
      const locale = owner.preferredLanguage === 'en' ? 'en' : 'ar';
      const topName = topProduct
        ? ((topProduct.nameJson as { ar?: string; en?: string })[locale] ??
          (topProduct.nameJson as { ar?: string }).ar ??
          '')
        : '';
      const ruleLines =
        locale === 'ar'
          ? rules
              .map((r) => `• ${r.params?.name ?? ''}`)
              .filter((l) => l.length > 2)
              .slice(0, 3)
              .join('<br/>')
          : rules
              .map((r) => `• ${r.params?.name ?? ''}`)
              .filter((l) => l.length > 2)
              .slice(0, 3)
              .join('<br/>');
      const subject =
        locale === 'ar'
          ? `نشرتك الأسبوعية — ${orders7} طلبات`
          : `Your Weekly Digest — ${orders7} orders`;
      const html = emailShell(
        `<div style="font-family:Tajawal,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 class="gob-text-strong">${locale === 'ar' ? 'أداء متجرك هذا الأسبوع' : 'Your store this week'}</h2>
          <p class="gob-text-soft">${locale === 'ar' ? 'الإيرادات' : 'Revenue'}: <strong>${revenue7}</strong> ${locale === 'ar' ? 'ر.س' : 'SAR'}</p>
          <p class="gob-text-soft">${locale === 'ar' ? 'الطلبات' : 'Orders'}: <strong>${orders7}</strong></p>
          ${topName ? `<p class="gob-text-soft">${locale === 'ar' ? 'الأكثر مبيعاً' : 'Top product'}: <strong>${topName}</strong></p>` : ''}
          <p class="gob-text-soft">${locale === 'ar' ? 'منتجات تحت حد التنبيه' : 'Low-stock products'}: <strong>${lowStockCount}</strong></p>
          ${ruleLines ? `<p class="gob-text-soft">${locale === 'ar' ? 'نصائح المستشار' : 'Advisor picks'}:<br/>${ruleLines}</p>` : ''}
          <a href="${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/store?tab=overview" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:12px">${locale === 'ar' ? 'فتح لوحة المتجر' : 'Open your dashboard'}</a>
        </div>`,
        locale === 'ar' ? 'rtl' : 'ltr',
      );
      await sendEmail({ to: owner.email, subject, html });
      emailed++;
    }
  }

  return { notified, rules: totalRules, emailed };
}

/** Shared D3 input gathering — used by vendorPortal.advisor and the digest. */
export async function advisorRulesForVendor(vendorId: number) {
  const { computeAdvisorRules } = await import('../lib/storeAdvisor');

  const products = await prisma.product.findMany({
    where: { vendorId, isActive: true },
    select: {
      id: true,
      nameJson: true,
      stock: true,
      lowStockThreshold: true,
      sales: true,
      createdAt: true,
    },
  });
  const productInputs = products.map((p) => {
    const weeks = Math.max((Date.now() - p.createdAt.getTime()) / (7 * 86_400_000), 1);
    return {
      id: p.id,
      nameAr: (p.nameJson as { ar?: string }).ar ?? '',
      stock: p.stock,
      threshold: p.lowStockThreshold ?? 5,
      salesPerWeek: p.sales / weeks,
    };
  });

  const deals = await prisma.storeDeal.findMany({
    where: { vendorId, isActive: true, endsAt: { lt: new Date() } },
    include: { product: { select: { nameJson: true } } },
  });
  const expiredDeals = deals.map((d) => ({
    id: d.id,
    titleAr: (d.product.nameJson as { ar?: string }).ar ?? '',
  }));

  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const orders = await prisma.storeOrder.findMany({
    where: { vendorId, createdAt: { gte: since30 } },
    select: { createdAt: true, totalAmount: true },
  });
  let weekendShare: number | null = null;
  if (orders.length > 0) {
    const weekend = orders.filter((o) => {
      const d = o.createdAt.getUTCDay();
      return d === 5 || d === 6;
    }).length;
    weekendShare = weekend / orders.length;
  }
  const since7 = new Date(Date.now() - 7 * 86_400_000);
  const aovOf = (list: typeof orders) =>
    list.length ? list.reduce((s, o) => s + Number(o.totalAmount), 0) / list.length : null;
  const aov7d = aovOf(orders.filter((o) => o.createdAt >= since7));
  const aov30d = aovOf(orders);

  return computeAdvisorRules({
    products: productInputs,
    expiredDeals,
    weekendShare,
    aov7d,
    aov30d,
  });
}

/**
 * handleLicenseExpiryReminders — G3: vendors whose license expires inside
 * the next 60 days get an inbox reminder (template `license_expiring`),
 * deduped by the licenseRemindedAt stamp (one nudge per ~10 days). Skips
 * far-future, already-expired and recently-reminded vendors. Swallowed
 * failures keep the weekly job from breaking on one bad row.
 */
export async function handleLicenseExpiryReminders(_job: Job<Record<string, never>>): Promise<{
  reminded: number;
}> {
  const now = new Date();
  const windowStart = now;
  const windowEnd = new Date(now.getTime() + 60 * 86_400_000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 86_400_000);

  const vendors = await prisma.vendor.findMany({
    where: {
      licenseExpiryDate: { gt: windowStart, lte: windowEnd },
      OR: [{ licenseRemindedAt: null }, { licenseRemindedAt: { lt: tenDaysAgo } }],
    },
    select: { id: true, userId: true, licenseExpiryDate: true },
  });

  let reminded = 0;
  for (const vendor of vendors) {
    const days = Math.max(
      1,
      Math.ceil((vendor.licenseExpiryDate!.getTime() - now.getTime()) / 86_400_000),
    );
    try {
      await notifyUser({
        userId: vendor.userId,
        templateKey: 'license_expiring',
        vars: { days },
        link: '/store?tab=overview',
        channels: ['in_app'],
      });
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { licenseRemindedAt: new Date() },
      });
      reminded++;
    } catch {
      // Never break the sweep on one row.
    }
  }

  return { reminded };
}

/**
 * handlePayoutScheduleJob — A2: settle scheduled vendors (WEEKLY/MONTHLY)
 * whose window has elapsed since lastPayoutRunAt (or creation on the
 * first run). Creates PENDING payout rows via the SAME settlement math
 * as the admin calculator — the job never moves money, only the ledger.
 * Money-integrity: transfers stay human (admin marks COMPLETED).
 */
export async function handlePayoutScheduleJob(_job: Job<Record<string, never>>): Promise<{
  checked: number;
  settledVendors: number;
}> {
  const now = new Date();
  const scheduled = await prisma.vendor.findMany({
    where: {
      isActive: true,
      payoutSchedule: { in: ['WEEKLY', 'MONTHLY'] },
    },
    select: {
      id: true,
      userId: true,
      payoutSchedule: true,
      lastPayoutRunAt: true,
      createdAt: true,
    },
  });

  const due = scheduled.filter((v) => {
    if (!v.lastPayoutRunAt) return true; // first run settles immediately
    const windowDays = v.payoutSchedule === 'WEEKLY' ? 7 : 30;
    return now.getTime() - v.lastPayoutRunAt.getTime() >= windowDays * 86_400_000;
  });

  let settledVendors = 0;
  for (const vendor of due) {
    try {
      const periodStart = vendor.lastPayoutRunAt ?? vendor.createdAt;
      const settlements = await calculateVendorSettlements(periodStart, now);
      const mine = settlements.find((s) => s.vendorId === vendor.id);
      if (mine && mine.orderCount > 0) {
        // Re-settlement replaces PENDING rows for the same window.
        await prisma.payout.deleteMany({
          where: { periodStart, periodEnd: now, status: 'PENDING', vendorId: vendor.id },
        });
        await prisma.payout.create({
          data: {
            vendorId: vendor.id,
            periodStart,
            periodEnd: now,
            amount: mine.amount,
            fee: mine.fee,
            status: 'PENDING',
          },
        });
        await notifyUser({
          userId: vendor.userId,
          templateKey: 'payout_processing',
          vars: { amount: String(mine.amount) },
          link: '/store?tab=earnings',
          channels: ['in_app'],
        });
      }
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { lastPayoutRunAt: now },
      });
      settledVendors++;
    } catch {
      // Never break the sweep on one row.
    }
  }

  return { checked: scheduled.length, settledVendors };
}

/**
 * handleOrderSlaSweep — A3: flag PENDING_FULFILLMENT orders that outlived
 * their vendor's promised window (fulfillmentSlaHours). One flag per
 * order (slaBreachedAt), one inbox notification per breach. FULFILLED
 * orders are never touched. Feeds the A5 quality score.
 */
export async function handleOrderSlaSweep(_job: Job<Record<string, never>>): Promise<{
  flagged: number;
}> {
  const now = new Date();
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    select: { id: true, userId: true, storeName: true, fulfillmentSlaHours: true },
  });
  const slaById = new Map(vendors.map((v) => [v.id, v.fulfillmentSlaHours]));
  const userIdById = new Map(vendors.map((v) => [v.id, v.userId]));

  const overdue = await prisma.storeOrder.findMany({
    where: { status: 'PENDING_FULFILLMENT', slaBreachedAt: null },
    select: { id: true, vendorId: true, createdAt: true },
  });

  let flagged = 0;
  for (const order of overdue) {
    const slaHours = slaById.get(order.vendorId) ?? 48;
    if (now.getTime() - order.createdAt.getTime() < slaHours * 3_600_000) continue;
    try {
      await prisma.storeOrder.update({
        where: { id: order.id },
        data: { slaBreachedAt: now },
      });
      await notifyUser({
        userId: userIdById.get(order.vendorId) ?? -1,
        templateKey: 'order_sla_breached',
        vars: { orderId: order.id },
        link: '/store?tab=orders',
        channels: ['in_app'],
      });
      flagged++;
    } catch {
      // Never break the sweep on one row.
    }
  }

  return { flagged };
}

/**
 * handleDisputeEscalationSweep — A4: store disputes that pass the 48h
 * vendor-response deadline without a reply escalate once (escalatedAt +
 * reason) and the vendor is nudged again. The admin disputes list shows
 * the escalated flag — the escalation IS the admin alert.
 */
export async function handleDisputeEscalationSweep(_job: Job<Record<string, never>>): Promise<{
  escalated: number;
}> {
  const deadline = new Date(Date.now() - 48 * 3_600_000);
  const candidates = await prisma.dispute.findMany({
    where: {
      status: { in: ['OPEN', 'UNDER_REVIEW'] },
      vendorRespondedAt: null,
      resolvedAt: null,
      escalatedAt: null,
      createdAt: { lte: deadline },
      storeOrderId: { not: null }, // store disputes only (B5 scope)
    },
    select: { id: true, storeOrderId: true },
  });

  let escalated = 0;
  for (const dispute of candidates) {
    try {
      const order = await prisma.storeOrder.findUnique({
        where: { id: dispute.storeOrderId! },
        select: { vendorId: true, vendor: { select: { userId: true } } },
      });
      await prisma.dispute.update({
        where: { id: dispute.id },
        data: { escalatedAt: new Date(), escalatedReason: 'VENDOR_RESPONSE_DEADLINE' },
      });
      if (order?.vendor.userId) {
        await notifyUser({
          userId: order.vendor.userId,
          templateKey: 'dispute_escalated',
          vars: { disputeId: dispute.id },
          link: '/store?tab=orders',
          channels: ['in_app'],
        });
      }
      escalated++;
    } catch {
      // Never break the sweep on one row.
    }
  }

  return { escalated };
}

/**
 * handleReviewReplyReminderSweep — B3: nudge vendors about reviews left
 * unanswered for 48h+. One reminder per review (reminderSentAt stamp);
 * replied reviews are never touched. Feeds the reviews-center reply flow
 * (E4) and closes the loop customers see on the storefront.
 */
export async function handleReviewReplyReminderSweep(_job: Job<Record<string, never>>): Promise<{
  reminded: number;
}> {
  const deadline = new Date(Date.now() - 48 * 3_600_000);
  const candidates = await prisma.productReview.findMany({
    where: { repliedAt: null, reminderSentAt: null, createdAt: { lte: deadline } },
    select: {
      id: true,
      product: { select: { nameJson: true, vendor: { select: { userId: true } } } },
    },
  });

  let reminded = 0;
  for (const review of candidates) {
    try {
      await prisma.productReview.update({
        where: { id: review.id },
        data: { reminderSentAt: new Date() },
      });
      const userId = review.product.vendor.userId;
      if (userId) {
        await notifyUser({
          userId,
          templateKey: 'review_reply_reminder',
          vars: { productName: (review.product.nameJson as { ar?: string }).ar ?? '' },
          link: '/store?tab=reviews',
          channels: ['in_app'],
        });
      }
      reminded++;
    } catch {
      // Never break the sweep on one row.
    }
  }

  return { reminded };
}

/**
 * handleQueueHealthCheck — D2: the periodic ops monitor. Snapshots every
 * queue's depth/failure counts and raises a Sentry warning/error when a
 * queue stalls or accumulates failures (the brain_code P0). Degrades to a
 * no-op assessment when Redis is down — infra absence is not a stall.
 */
export async function handleQueueHealthCheck(): Promise<{
  status: 'ok' | 'warn' | 'critical';
  reasons: string[];
}> {
  const { getQueueHealth, assessQueueHealth } = await import('../lib/queueHealth');
  const { captureMessage } = await import('../lib/sentry');
  const { sendAlert } = await import('../lib/alerting');
  const health = await getQueueHealth();
  const assessed = assessQueueHealth(health);

  // Disk headroom (AUDIT item 8): the worker volume is where backups,
  // uploads and logs live — page before a full disk takes the app down.
  try {
    const { statfs } = await import('node:fs/promises');
    const s = await statfs('/');
    const usedPct = 1 - s.bavail / s.blocks;
    if (usedPct > 0.8) {
      const reason = `disk ${Math.round(usedPct * 100)}% used`;
      assessed.reasons.push(reason);
      if (assessed.status === 'ok') assessed.status = 'warn';
      await sendAlert('disk-80', 'Disk usage above 80%', reason, 'warning');
    }
  } catch {
    // statfs unavailable — degrade silently.
  }

  if (assessed.status !== 'ok') {
    await captureMessage(
      `Queue health ${assessed.status}: ${assessed.reasons.join('; ')}`,
      assessed.status === 'critical' ? 'error' : 'warning',
    );
    await sendAlert(
      'queue-health',
      `Queue health ${assessed.status}`,
      assessed.reasons.join('; '),
      assessed.status === 'critical' ? 'critical' : 'warning',
    );
  }
  return assessed;
}

/**
 * handleWebhookDelivery — D1b: POST the signed event to the vendor's
 * endpoint. Non-2xx throws so BullMQ retries (5 exponential attempts);
 * deleted/deactivated webhooks return without delivering.
 */
export async function handleWebhookDelivery(
  job: Job<{
    webhookId: number;
    event: string;
    payload: Record<string, unknown>;
  }>,
): Promise<{ ok: boolean }> {
  const { webhookId, event, payload } = job.data;
  const webhook = await prisma.vendorWebhook.findUnique({ where: { id: webhookId } });
  if (!webhook || !webhook.isActive) return { ok: true };

  const { signWebhookPayload } = await import('../lib/webhookSigning');
  const body = JSON.stringify({ event, data: payload, deliveredAt: new Date().toISOString() });
  const signature = signWebhookPayload(webhook.secret, body);
  const res = await fetch(webhook.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gob-Signature': `sha256=${signature}`,
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Webhook #${webhookId} delivery failed: HTTP ${res.status}`);
  }
  return { ok: true };
}

// ── R3 media pipeline (REELS_SHOPPABLE_PLAN) ──────────────────────────

export interface ShortMediaJob {
  shortId: number;
}

/** Callback-style execFile wrapper — resolves { stdout, stderr } and
 *  rejects on any spawn failure (missing binary included). */
function runBinary(
  cmd: string,
  args: string[],
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout: stdout ?? '', stderr: stderr ?? '' });
    });
  });
}

/**
 * handleShortMediaJob — R3: enrich a reel upload with real metadata.
 * ffprobe replaces the uploader-supplied durationSec; ffmpeg extracts a
 * poster frame (720px wide) uploaded next to the original. Both binaries
 * are OPTIONAL — dev/CI machines without them degrade gracefully and
 * leave the short untouched (no fabricated metadata, no job failures).
 */
export async function handleShortMediaJob(
  job: Job<ShortMediaJob>,
): Promise<{ durationSec?: number; poster?: boolean; skipped?: string }> {
  const { shortId } = job.data;
  const short = await prisma.short.findUnique({ where: { id: shortId } });
  if (!short || !short.videoUrl) return { skipped: 'no-video' };

  let durationSec: number | null = null;
  let posterUrl: string | null = null;

  try {
    const { stdout } = await runBinary(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', short.videoUrl],
      15_000,
    );
    const parsed = JSON.parse(stdout) as { format?: { duration?: string } };
    const d = Number(parsed.format?.duration);
    if (Number.isFinite(d) && d > 0) durationSec = Math.round(d);
  } catch {
    // binary missing or probe failed — keep the uploader's durationSec
  }

  try {
    const tmp = path.join(os.tmpdir(), `poster-${shortId}-${Date.now()}.jpg`);
    await runBinary(
      'ffmpeg',
      ['-y', '-i', short.videoUrl, '-ss', '1', '-frames:v', '1', '-vf', 'scale=720:-2', tmp],
      30_000,
    );
    const buffer = await fs.readFile(tmp);
    const up = await uploadFile(buffer, 'poster.jpg', `media/${shortId}`, 'image/jpeg');
    posterUrl = up.url;
    await fs.unlink(tmp).catch(() => {});
  } catch {
    // no ffmpeg — no poster
  }

  if (durationSec === null && posterUrl === null) return { skipped: 'no-media-binaries' };

  await prisma.short.update({
    where: { id: shortId },
    data: {
      ...(durationSec !== null ? { durationSec } : {}),
      ...(posterUrl ? { thumbnailUrl: posterUrl } : {}),
    },
  });

  return { durationSec: durationSec ?? short.durationSec, poster: posterUrl !== null };
}
