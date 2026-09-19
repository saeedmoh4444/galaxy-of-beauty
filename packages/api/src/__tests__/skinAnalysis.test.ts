/**
 * skinAnalysis router tests — 3.1 perception bridge.
 *
 * analyze() runs OpenAI Vision when OPENAI_API_KEY is set (fetch is
 * stubbed) and falls back to a deterministic stub result without a key.
 * On a successful strict parse it also merges the parsed fields into the
 * customer's BeautyProfile (the 3.1 bridge); on failure or no key it
 * touches nothing. The input contract stays z.string().url() — clients
 * must upload first via uploads.uploadMedia (file:// URIs are rejected).
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const IMAGE_URL = 'https://galaxyofbeauty.sa/uploads/media/selfie.jpg';

let user: JwtPayload;
const createdUserIds: number[] = [];
const createdAnalysisIds: number[] = [];
const createdProfileIds: number[] = [];

async function caller(u: JwtPayload) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

function openAiResponse(content: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
}

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser({ role: 'CUSTOMER' }) });
  createdUserIds.push(u.id);
  user = { id: u.id, role: 'CUSTOMER', email: u.email };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

afterAll(async () => {
  await prisma.skinAnalysis.deleteMany({ where: { id: { in: createdAnalysisIds } } });
  await prisma.beautyProfile.deleteMany({ where: { id: { in: createdProfileIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('skinAnalysis.analyze', () => {
  it('rejects non-URL image inputs (file:// camera URIs must be uploaded first)', async () => {
    await expect(
      (await caller(user)).skinAnalysis.analyze({
        imageUrl: 'file:///data/user/0/app/cache/selfie.jpg',
      }),
    ).rejects.toThrow();
  });

  it('without a key: creates an analysis with a fallback result and NO beauty profile', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const res = await (await caller(user)).skinAnalysis.analyze({ imageUrl: IMAGE_URL });
    createdAnalysisIds.push(res.id);
    expect(res.resultJson).toMatchObject({ skinType: 'unknown' });
    const profile = await prisma.beautyProfile.findUnique({ where: { userId: user.id } });
    expect(profile).toBeNull();
  });

  it('with a key: strict-parses the Vision result and merges fields into BeautyProfile', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    // Pre-set a field the AI does not return — the bridge must never wipe it.
    const preProfile = await prisma.beautyProfile.create({
      data: {
        userId: user.id,
        hairType: 'wavy',
        allergies: [],
        preferredScents: [],
        concerns: [],
        preferences: [],
        colorPalette: [],
        fitnessGoals: [],
      },
    });
    createdProfileIds.push(preProfile.id);

    const content = JSON.stringify({
      skinType: 'dry',
      concerns: ['dryness', 'redness'],
      hydrationLevel: 'low',
      sensitivityLevel: 'medium',
      ageEstimate: 29,
      undertone: 'warm',
      faceShape: 'oval',
      colorPalette: ['#E8C4A0', '#C98F6E', '#A45B3F'],
      recommendations: { services: ['ترطيب عميق'], products: ['سيروم هيالورونيك'], routine: [] },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(openAiResponse(content)));

    const res = await (await caller(user)).skinAnalysis.analyze({ imageUrl: IMAGE_URL });
    createdAnalysisIds.push(res.id);
    expect(res.resultJson).toMatchObject({ skinType: 'dry', undertone: 'warm', faceShape: 'oval' });
    expect(res.resultJson.colorPalette).toEqual(['#E8C4A0', '#C98F6E', '#A45B3F']);

    const profile = await prisma.beautyProfile.findUnique({ where: { userId: user.id } });
    expect(profile).not.toBeNull();
    expect(profile!.skinType).toBe('dry');
    expect(profile!.undertone).toBe('warm');
    expect(profile!.faceShape).toBe('oval');
    expect(profile!.concerns).toEqual(['dryness', 'redness']);
    expect(profile!.colorPalette).toEqual(['#E8C4A0', '#C98F6E', '#A45B3F']);
    // Pre-set field untouched — merge-only, never wipes.
    expect(profile!.hairType).toBe('wavy');
  });

  it('falls back to the stub on an invalid Vision payload and touches no profile', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    // faceShape value is not in the schema enum → strict parse must fail.
    const content = JSON.stringify({
      skinType: 'dry',
      undertone: 'warm',
      faceShape: 'triangle',
      colorPalette: ['#E8C4A0'],
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(openAiResponse(content)));

    const res = await (await caller(user)).skinAnalysis.analyze({ imageUrl: IMAGE_URL });
    createdAnalysisIds.push(res.id);
    expect(res.resultJson).toMatchObject({ skinType: 'unknown' });

    // Profile keeps only the earlier bridge write (dry/warm from the
    // previous test), never the invalid faceShape.
    const profile = await prisma.beautyProfile.findUnique({ where: { userId: user.id } });
    expect(profile!.faceShape).toBe('oval');
  });
});
