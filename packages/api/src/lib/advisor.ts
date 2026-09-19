/**
 * 3.3 Proactive AI advisor — deterministic insight engine.
 *
 * Pure functions over local data (no OpenAI, no feature flag, no quota):
 * smart cadence reminders, occasion detector (Eid/Ramadan), budget coach,
 * and week-over-week trend alerts. Shared by the beautyInsights.advisor
 * procedure and the daily insightsSweep worker.
 *
 * Every insight is bilingual with an emoji, a deep link and a priority
 * (1 = most urgent) — the sweep notifies the top insight only.
 */
import { prisma } from '@galaxy/db';
import { getUpcomingOccasions } from '@galaxy/shared';
import type { UpcomingOccasion } from '@galaxy/shared';

/** Booking statuses where money was actually charged (excludes
 * REJECTED/CANCELLED/NO_SHOW/REQUESTED). Also fixes beautyBudget.get. */
export const SPENT_STATUSES = ['PAID', 'IN_PROGRESS', 'COMPLETED'] as const;

/** Recommended revisit cadence per category slug, in weeks. */
const CADENCE_WEEKS: Record<string, number> = {
  'hair-care': 8,
  haircut: 6,
  'hair-color': 6,
  hairstyling: 6,
  'nail-care': 3,
  manicure: 3,
  pedicure: 3,
  'skin-care': 4,
  'facial-cleansing': 4,
  massage: 4,
  'spa-wellness': 4,
  henna: 6,
  makeup: 6,
  'evening-makeup': 6,
  waxing: 5,
  'lashes-brows': 4,
  'body-treatments': 8,
};
const DEFAULT_CADENCE_WEEKS = 6;
/** A category becomes "due" at 75% of its recommended cadence. */
const DUE_RATIO = 0.75;

/** ٠-٩ Arabic-Indic digits for Arabic copy. */
function arNum(n: number): string {
  const digits = '٠١٢٣٤٥٦٧٨٩';
  return String(n).replace(/\d/g, (d) => digits[Number(d)]!);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export interface AdvisorInsight {
  type: 'reminder' | 'occasion' | 'budget' | 'trend';
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link: string;
  emoji: string;
  /** 1 = most urgent; the sweep notifies the lowest priority value. */
  priority: number;
}

export interface ReminderInsight {
  categorySlug: string;
  categoryNameAr: string;
  categoryNameEn: string;
  daysSince: number;
  dueDays: number;
  suggestedServiceId: number;
}

export interface OccasionInsight {
  type: 'occasion';
  occasion: UpcomingOccasion;
  daysTo: number;
  categorySlug: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link: string;
  emoji: string;
  priority: 2;
}

export interface BudgetInsight {
  type: 'budget';
  spent: number;
  budget: number;
  remaining: number;
  affordableCount: number;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link: string;
  emoji: string;
  priority: 3;
}

export interface TrendInsight {
  type: 'trend';
  categorySlug: string;
  categoryNameAr: string;
  categoryNameEn: string;
  cityCount: number;
  city: string | null;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link: string;
  emoji: string;
  priority: 4;
}

const SERVICES_LINK = (slug: string): string => `/services?category=${slug}`;

// ── Smart reminders: cadence over COMPLETED bookings ─────────────

export async function buildSmartReminders(
  userId: number,
  now = new Date(),
): Promise<ReminderInsight[]> {
  const bookings = await prisma.booking.findMany({
    where: { customerId: userId, status: 'COMPLETED' },
    include: { service: { select: { categoryId: true } } },
    orderBy: { startAt: 'desc' },
    take: 200,
  });

  // Latest completed booking per category (bookings are sorted newest-first).
  const latestByCat = new Map<number, Date>();
  for (const b of bookings) {
    if (!latestByCat.has(b.service.categoryId)) latestByCat.set(b.service.categoryId, b.startAt);
  }
  if (latestByCat.size === 0) return [];

  const categories = await prisma.category.findMany({
    where: { id: { in: [...latestByCat.keys()] } },
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const reminders: ReminderInsight[] = [];
  for (const [categoryId, lastStart] of latestByCat) {
    const cat = categoryById.get(categoryId);
    if (!cat) continue;
    const weeks = CADENCE_WEEKS[cat.slug] ?? DEFAULT_CADENCE_WEEKS;
    const dueDays = Math.round(weeks * 7 * DUE_RATIO);
    const daysSince = daysBetween(lastStart, now);
    if (daysSince < dueDays) continue;

    // Suggested next booking: the most popular active service in the category.
    const suggested = await prisma.service.findFirst({
      where: { categoryId, isActive: true },
      orderBy: [{ isPopular: 'desc' }, { id: 'asc' }],
    });
    if (!suggested) continue;

    reminders.push({
      categorySlug: cat.slug,
      categoryNameAr: (cat.nameJson as { ar: string }).ar,
      categoryNameEn: (cat.nameJson as { en: string }).en,
      daysSince,
      dueDays,
      suggestedServiceId: suggested.id,
    });
  }
  return reminders.sort((a, b) => b.daysSince - a.daysSince);
}

// ── Occasion detector ────────────────────────────────────────────

const OCCASION_CATEGORY: Record<UpcomingOccasion['key'], string> = {
  eid_al_fitr: 'makeup',
  eid_al_adha: 'henna',
  ramadan_start: 'spa-wellness',
};

export function buildOccasionInsight(date = new Date()): OccasionInsight | null {
  const upcoming = getUpcomingOccasions(date, 21);
  if (upcoming.length === 0) return null;
  const occasion = upcoming[0]!;
  // "in N days" semantics — ceil the raw difference, never 0.
  const msUntil = new Date(`${occasion.date}T00:00:00Z`).getTime() - date.getTime();
  const daysTo = Math.max(1, Math.ceil(msUntil / 86_400_000));
  const categorySlug = OCCASION_CATEGORY[occasion.key];

  return {
    type: 'occasion',
    occasion,
    daysTo,
    categorySlug,
    titleAr: `${occasion.labelAr} بعد ${arNum(daysTo)} يوم 🎉`,
    titleEn: `${occasion.labelEn} in ${daysTo} days 🎉`,
    bodyAr: `جهزي إطلالتكِ للعيد — احجزي موعدكِ الآن قبل اكتمال الجداول.`,
    bodyEn: `Prepare your look for the occasion — book early while slots last.`,
    link: SERVICES_LINK(categorySlug),
    emoji: occasion.emoji,
    priority: 2,
  };
}

// ── Budget coach ─────────────────────────────────────────────────

export async function buildBudgetInsight(
  userId: number,
  now = new Date(),
): Promise<BudgetInsight | null> {
  const month = now.toISOString().slice(0, 7);
  const budget = await prisma.beautyBudget.findUnique({
    where: { userId_month: { userId, month } },
  });
  if (!budget) return null;

  const monthStart = new Date(`${month}-01T00:00:00.000Z`);
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: userId,
      status: { in: [...SPENT_STATUSES] },
      createdAt: { gte: monthStart },
    },
    select: { totalAmount: true },
  });

  const spent = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const limit = Number(budget.budget);
  const remaining = limit - spent;
  if (remaining <= 0) return null;

  const avg = bookings.length > 0 ? spent / bookings.length : limit;
  const affordableCount = Math.max(1, Math.floor(remaining / avg));

  return {
    type: 'budget',
    spent,
    budget: limit,
    remaining,
    affordableCount,
    titleAr: `ميزانيتكِ لهذا الشهر بأمان`,
    titleEn: `Your monthly budget is on track`,
    bodyAr: `أنفقتِ ${arNum(spent)} من أصل ${arNum(limit)} ر.س — المتبقي ${arNum(remaining)} ر.س ويمكنكِ حجز ${arNum(affordableCount)} خدمة إضافية.`,
    bodyEn: `You've spent ${spent} of ${limit} SAR — ${remaining} SAR left, about ${affordableCount} more service${affordableCount === 1 ? '' : 's'} fit your budget.`,
    link: '/beauty-budget',
    emoji: '💸',
    priority: 3,
  };
}

// ── Trend alerts: week-over-week category risers ─────────────────

export async function buildTrendInsight(
  userId: number,
  now = new Date(),
): Promise<TrendInsight | null> {
  const weekMs = 7 * 86_400_000;
  const thisWeekStart = new Date(now.getTime() - weekMs);
  const lastWeekStart = new Date(now.getTime() - 2 * weekMs);

  const recent = await prisma.booking.findMany({
    where: { createdAt: { gte: lastWeekStart } },
    include: { service: { select: { categoryId: true } } },
    take: 5000,
  });

  const thisWeek = new Map<number, number>();
  const lastWeek = new Map<number, number>();
  for (const b of recent) {
    const map = b.createdAt >= thisWeekStart ? thisWeek : lastWeek;
    map.set(b.service.categoryId, (map.get(b.service.categoryId) ?? 0) + 1);
  }

  let topCat: { id: number; delta: number } | null = null;
  for (const [categoryId, count] of thisWeek) {
    const prev = lastWeek.get(categoryId) ?? 0;
    const delta = count - prev;
    if (delta <= 0) continue;
    if (!topCat || delta > topCat.delta || (delta === topCat.delta && categoryId < topCat.id)) {
      topCat = { id: categoryId, delta };
    }
  }
  if (!topCat) return null;

  const cat = await prisma.category.findUnique({ where: { id: topCat.id } });
  if (!cat) return null;

  // Technicians offering this category, counted for the user's city.
  const address = await prisma.address.findFirst({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
  const techServices = await prisma.technicianService.findMany({
    where: { service: { categoryId: cat.id } },
    include: { technician: { select: { city: true } } },
  });
  const cityCount = address
    ? techServices.filter((t) => t.technician.city === address.city).length
    : techServices.length;
  const city = address?.city ?? null;

  return {
    type: 'trend',
    categorySlug: cat.slug,
    categoryNameAr: (cat.nameJson as { ar: string }).ar,
    categoryNameEn: (cat.nameJson as { en: string }).en,
    cityCount,
    city,
    titleAr: `رائج هذا الأسبوع: ${(cat.nameJson as { ar: string }).ar} 🔥`,
    titleEn: `Trending this week: ${(cat.nameJson as { en: string }).en} 🔥`,
    bodyAr:
      city && cityCount > 0
        ? `${arNum(cityCount)} متخصصة في ${city} تقدم هذه الخدمة — احجزي قبل الامتلاء.`
        : `احجزي موعدكِ قبل امتلاء الجداول هذا الأسبوع.`,
    bodyEn:
      city && cityCount > 0
        ? `${cityCount} pro${cityCount === 1 ? '' : 's'} in ${city} offer this — book before slots fill.`
        : `Book before slots fill up this week.`,
    link: SERVICES_LINK(cat.slug),
    emoji: '🔥',
    priority: 4,
  };
}

// ── Combined insights (sweep + router share this) ────────────────

export async function buildAdvisorInsights(
  userId: number,
  now = new Date(),
): Promise<AdvisorInsight[]> {
  const [reminders, occasion, budget, trend] = await Promise.all([
    buildSmartReminders(userId, now),
    Promise.resolve(buildOccasionInsight(now)),
    buildBudgetInsight(userId, now),
    buildTrendInsight(userId, now),
  ]);

  const insights: AdvisorInsight[] = [];

  for (const r of reminders) {
    insights.push({
      type: 'reminder',
      titleAr: `حان وقت موعدكِ: ${r.categoryNameAr}`,
      titleEn: `Time for your ${r.categoryNameEn}`,
      bodyAr: `آخر موعد ${r.categoryNameAr} كان منذ ${arNum(r.daysSince)} يوم — جددي إشراقتكِ الآن.`,
      bodyEn: `Your last ${r.categoryNameEn} was ${r.daysSince} days ago — time for a refresh.`,
      link: SERVICES_LINK(r.categorySlug),
      emoji: '⏰',
      priority: 1,
    });
  }
  if (occasion) insights.push(occasion);
  if (budget) insights.push(budget);
  if (trend) insights.push(trend);

  return insights.sort((a, b) => a.priority - b.priority);
}
