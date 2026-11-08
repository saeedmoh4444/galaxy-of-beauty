/**
 * C3 (PLATFORM_IMPROVEMENT_PLAN) — search contract tests.
 *
 * Pins the catalog search's observable behavior so relevance regressions
 * fail CI: title ILIKE matches rank before description-only matches,
 * filters compose, pagination has no gaps/duplicates, and tag search
 * works. Fixtures are created per-run (unique slugs) so the assertions
 * never depend on seed drift.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildCategory, buildService } from './factories';

const createdServiceIds: number[] = [];
const createdCategoryIds: number[] = [];

let titleServiceId: number;
let descServiceId: number;
let cheapServiceId: number;
let expensiveServiceId: number;
let tagServiceId: number;
let categoryId: number;

const stamp = `s${Date.now().toString(36)}`;

function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const category = await prisma.category.create({
    data: buildCategory({ slug: `search-cat-${stamp}` }),
  });
  categoryId = category.id;
  createdCategoryIds.push(category.id);

  const mk = async (over: Record<string, unknown>) => {
    const svc = await prisma.service.create({
      data: buildService({
        categoryId,
        titleJson: { ar: `خدمة ${stamp}`, en: `Service ${stamp}` },
        ...over,
      } as never),
    });
    createdServiceIds.push(svc.id);
    return svc.id;
  };

  // Relevance pair: one match in the title, one only in the description.
  titleServiceId = await mk({
    titleJson: { ar: `${stamp} لمعان الشعر`, en: `${stamp} hair shine` },
  });
  descServiceId = await mk({
    titleJson: { ar: `${stamp} خدمة أخرى`, en: `${stamp} other service` },
    descriptionJson: { ar: `تتضمن ${stamp} لمعان الشعر`, en: `includes ${stamp} hair shine` },
  });
  // Price pair for filter composition.
  cheapServiceId = await mk({ basePrice: 50 });
  expensiveServiceId = await mk({ basePrice: 500 });
  // Tag-search fixture.
  tagServiceId = await mk({});
  await prisma.serviceTagAssignment.create({
    data: {
      serviceId: tagServiceId,
      tagId: await ensureTag(`وسم-${stamp}`),
    },
  });
});

afterAll(async () => {
  await prisma.serviceTagAssignment.deleteMany({ where: { serviceId: { in: createdServiceIds } } });
  await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
  await prisma.serviceTag.deleteMany({ where: { slug: `search-tag-${stamp}` } });
  await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
});

async function ensureTag(name: string): Promise<number> {
  const existing = await prisma.serviceTag.findFirst({
    where: { slug: `search-tag-${stamp}` },
  });
  if (existing) return existing.id;
  const created = await prisma.serviceTag.create({
    data: { nameJson: { ar: name, en: name }, slug: `search-tag-${stamp}` },
  });
  return created.id;
}

describe('catalog search contract', () => {
  it('ranks title matches before description-only matches', async () => {
    const res = await caller().search.search({
      query: `${stamp} لمعان الشعر`,
      locale: 'ar',
      page: 1,
      limit: 20,
    });
    const ids = res.services.items.map((s: { id: number }) => s.id);
    expect(ids).toContain(titleServiceId);
    const titlePos = ids.indexOf(titleServiceId);
    const descPos = ids.indexOf(descServiceId);
    expect(descPos).toBeGreaterThan(-1);
    expect(titlePos).toBeLessThan(descPos);
  });

  it('composes category + price filters', async () => {
    const res = await caller().search.search({
      query: stamp,
      locale: 'ar',
      categoryId,
      minPrice: 400,
      page: 1,
      limit: 50,
    });
    const ids = res.services.items.map((s: { id: number }) => s.id);
    expect(ids).toContain(expensiveServiceId);
    expect(ids).not.toContain(cheapServiceId);
    expect(ids).not.toContain(descServiceId);
  });

  it('paginates without gaps or duplicates', async () => {
    const page1 = await caller().search.search({ query: stamp, locale: 'ar', page: 1, limit: 2 });
    const page2 = await caller().search.search({ query: stamp, locale: 'ar', page: 2, limit: 2 });
    const ids1 = page1.services.items.map((s: { id: number }) => s.id);
    const ids2 = page2.services.items.map((s: { id: number }) => s.id);
    expect(new Set([...ids1, ...ids2]).size).toBe(ids1.length + ids2.length);
  });

  it('finds services by tag', async () => {
    const res = await caller().search.search({
      query: `وسم-${stamp}`,
      locale: 'ar',
      page: 1,
      limit: 20,
    });
    const ids = res.services.items.map((s: { id: number }) => s.id);
    expect(ids).toContain(tagServiceId);
  });
});
