/**
 * 3.4 — automated content generation.
 *
 * Provider abstraction: OpenAI when OPENAI_API_KEY is configured,
 * deterministic mock otherwise. Covers generation shapes, bilingual
 * outputs, the provider status, validation, and role guards.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import { prisma } from '@galaxy/db';
import type { JwtPayload } from '../lib/jwt';

const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'CUSTOMER' | 'ADMIN' = 'ADMIN'): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser({ role }) });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

let admin: JwtPayload;
let customer: JwtPayload;
const savedEnv: Record<string, string | undefined> = {};

beforeAll(async () => {
  admin = await makeUser('ADMIN');
  customer = await makeUser('CUSTOMER');
  savedEnv['OPENAI_API_KEY'] = process.env['OPENAI_API_KEY'];
  delete process.env['OPENAI_API_KEY']; // deterministic mock path
}, 15000);

afterAll(async () => {
  if (savedEnv['OPENAI_API_KEY'] !== undefined) {
    process.env['OPENAI_API_KEY'] = savedEnv['OPENAI_API_KEY'];
  }
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    /* best-effort */
  }
});

describe('contentGen router', () => {
  it('reports the mock provider when no key is configured', async () => {
    const status = await (await caller(null)).contentGen.status();
    expect(status.provider).toBe('mock');
    expect(status.configured).toBe(false);
  });

  it('generates a bilingual service description', async () => {
    const res = await (
      await caller(admin)
    ).contentGen.generateServiceDescription({
      serviceNameAr: 'مكياج عروس',
      serviceNameEn: 'Bridal Makeup',
      keywords: ['احترافي', 'إطلالة'],
    });
    expect(res.provider).toBe('mock');
    expect(res.ar).toContain('مكياج عروس');
    expect(res.en).toContain('Bridal Makeup');
  });

  it('generates a bilingual social caption with the requested tone', async () => {
    const res = await (
      await caller(admin)
    ).contentGen.generateSocialCaption({
      topic: 'عرض الجمعة',
      platform: 'instagram',
      tone: 'حماسي',
    });
    expect(res.ar.length).toBeGreaterThan(20);
    expect(res.en.length).toBeGreaterThan(20);
  });

  it('generates a FAQ answer that echoes the question topic', async () => {
    const res = await (
      await caller(admin)
    ).contentGen.generateFaqAnswer({
      question: 'كم تستغرق جلسة المكياج؟',
      serviceName: 'مكياج كامل',
    });
    expect(res.ar.length).toBeGreaterThan(20);
    expect(res.en.length).toBeGreaterThan(20);
  });

  it('generates a blog draft with a DRAFT status', async () => {
    const res = await (
      await caller(admin)
    ).contentGen.generateBlogDraft({
      titleAr: 'روتين العناية بالبشرة',
      titleEn: 'Skincare Routine',
    });
    expect(res.status).toBe('DRAFT');
    expect(res.bodyAr.length).toBeGreaterThan(100);
    expect(res.bodyEn.length).toBeGreaterThan(100);
  });

  it('is deterministic in mock mode for identical inputs', async () => {
    const c = await caller(admin);
    const a = await c.contentGen.generateServiceDescription({
      serviceNameAr: 'باديكير',
      serviceNameEn: 'Pedicure',
    });
    const b = await c.contentGen.generateServiceDescription({
      serviceNameAr: 'باديكير',
      serviceNameEn: 'Pedicure',
    });
    expect(a.ar).toBe(b.ar);
    expect(a.en).toBe(b.en);
  });

  it('rejects invalid inputs', async () => {
    const c = await caller(admin);
    await expect(
      c.contentGen.generateServiceDescription({ serviceNameAr: '', serviceNameEn: 'X' }),
    ).rejects.toThrow();
  });

  it('rejects non-admin generation', async () => {
    const c = await caller(customer);
    await expect(
      c.contentGen.generateServiceDescription({ serviceNameAr: 'x', serviceNameEn: 'x' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('uses the OpenAI provider when a key is configured (mocked fetch)', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"ar":"وصف","en":"Description"}' } }],
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    process.env['OPENAI_API_KEY'] = 'sk-test';
    try {
      const res = await (
        await caller(admin)
      ).contentGen.generateServiceDescription({
        serviceNameAr: 'قص شعر',
        serviceNameEn: 'Haircut',
      });
      expect(res.provider).toBe('openai');
      expect(res.ar).toBe('وصف');
      expect(res.en).toBe('Description');
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
      delete process.env['OPENAI_API_KEY'];
    }
  });
});
