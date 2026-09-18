/**
 * 3.1 Beauty DNA — Skin / Hair / Fragrance Match (Phase 3).
 *
 * All procedures are pure deterministic scoring over local data: no OpenAI
 * calls, no quota tracking, no feature flag (same contract as
 * ai.getRecommendations — pure scoring must never consume a subscriber's
 * quota). The OpenAI perception step lives in skinAnalysis.analyze, which
 * feeds BeautyProfile; this router turns the profile into ranked matches.
 *
 * Every match entry carries `score`, `matchPct` (50–99) and stable `reasons`
 * codes that the UI maps to `beautyDna.reason.<code>` i18n keys. Rankings
 * are fully deterministic (score desc, sales desc, id asc).
 */
import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { Prisma } from '@galaxy/db';
import {
  HAIR_LENGTH_RANK,
  HAIR_STYLE_CATALOG,
  SKIN_TONE_DEPTH,
  UNDERTONES,
  FACE_SHAPES,
  SEASONS,
  parseProductAttributes,
  getClimateSeason,
} from '@galaxy/shared';
import type {
  FaceShape,
  HairLengthKey,
  HairStyleEntry,
  MakeupAttributes,
  ProductMatchAttributes,
  Season,
} from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

const SKIN_TONES = ['fair', 'medium', 'olive', 'tan', 'deep'] as const;
const HAIR_TYPES = ['straight', 'wavy', 'curly', 'coily'] as const;
const HAIR_LENGTHS = ['short', 'medium', 'long'] as const;

/** +25 depth in the tone window / +12 adjacent window. */
function depthScore(depth: number, [min, max]: readonly [number, number]): number {
  if (depth >= min && depth <= max) return 25;
  if (depth === min - 1 || depth === max + 1) return 12;
  return 0;
}

/** +20 exact undertone, +10 for universally-flattering neutral. */
function undertoneScore(profile: string | null, product: string): number {
  if (!profile) return 0;
  if (product === profile) return 20;
  if (product === 'neutral') return 10;
  return 0;
}

function matchPct(score: number): number {
  return Math.min(99, 50 + score);
}

/**
 * Deterministic product ranking: score desc, then sales desc, then id asc.
 * (Array.sort is stable, but two identical products — e.g. a seeded demo
 * shade and a vendor's own — must rank consistently across calls.)
 */
function rankProducts<T extends { score: number; sales: number; id: number }>(items: T[]): T[] {
  return items.sort((a, b) => b.score - a.score || b.sales - a.sales || a.id - b.id);
}

/** Serialize a DB product for match payloads (Decimal → number). */
function productPayload(p: {
  id: number;
  nameJson: unknown;
  brand: string | null;
  emoji: string;
  imageUrl: string | null;
  price: { toNumber(): number };
  attributes: unknown;
  sales: number;
}) {
  return {
    id: p.id,
    nameJson: p.nameJson,
    brand: p.brand,
    emoji: p.emoji,
    imageUrl: p.imageUrl,
    price: p.price.toNumber(),
    attributes: p.attributes,
  };
}

// Fragrance season→family bonus (fresh/citrus in summer, floral in spring,
// woody/oriental/sweet in winter).
const SEASON_FAMILIES: Record<Season, string[]> = {
  summer: ['fresh', 'citrus'],
  spring: ['floral', 'fresh'],
  winter: ['woody', 'oriental', 'sweet'],
  autumn: ['woody', 'sweet'],
};

export const beautyDnaRouter = router({
  // ── Skin Match: tone+undertone → foundation/concealer shades ──
  skinMatch: customerProcedure
    .input(
      z.object({
        skinTone: z.enum(SKIN_TONES).optional(),
        undertone: z.enum(UNDERTONES).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const profile = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
      const skinTone = input.skinTone ?? profile?.skinTone;
      const undertone = input.undertone ?? profile?.undertone ?? null;

      if (!skinTone) {
        return {
          matches: [],
          total: 0,
          missing: ['skinTone'],
          profile: { skinTone: null, undertone },
        };
      }

      const makeupCat = await prisma.productCategory.findUnique({
        where: { slug: 'product-makeup' },
      });
      const products = makeupCat
        ? await prisma.product.findMany({
            where: {
              isActive: true,
              categoryId: makeupCat.id,
              attributes: { not: Prisma.DbNull },
            },
            take: 200,
          })
        : [];

      const window = SKIN_TONE_DEPTH[skinTone as keyof typeof SKIN_TONE_DEPTH] ?? [3, 4];
      const matches = products
        .map((p) => ({ product: p, attrs: parseProductAttributes(p.attributes) }))
        .filter(
          (x): x is { product: (typeof products)[number]; attrs: MakeupAttributes } =>
            x.attrs?.kind === 'makeup',
        )
        .map(({ product, attrs }) => {
          const reasons: string[] = [];
          let score = depthScore(attrs.depth, window);
          if (score > 0) reasons.push('tone_depth');
          const uScore = undertoneScore(undertone, attrs.undertone);
          if (uScore > 0) reasons.push('tone_undertone');
          score += uScore;
          return {
            product: productPayload(product),
            score,
            reasons,
            // Ranking keys only — stripped from the response.
            sales: product.sales,
            id: product.id,
          };
        });

      const ranked = rankProducts(matches).slice(0, 8);

      return {
        matches: ranked.map(({ product, score, reasons }) => ({
          product,
          score,
          matchPct: matchPct(score),
          reasons,
        })),
        total: matches.length,
        missing: [],
        profile: { skinTone, undertone },
      };
    }),

  // ── Hair Match: face shape + texture → style catalog ──
  hairMatch: customerProcedure
    .input(
      z.object({
        faceShape: z.enum(FACE_SHAPES).optional(),
        hairType: z.enum(HAIR_TYPES).optional(),
        hairLength: z.enum(HAIR_LENGTHS).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const profile = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
      // Profile columns are free strings — validate against the catalog.
      const rawFace = input.faceShape ?? profile?.faceShape;
      const faceShape: FaceShape | null = FACE_SHAPES.includes(rawFace as FaceShape)
        ? (rawFace as FaceShape)
        : null;
      const hairType = input.hairType ?? profile?.hairType;
      const hairLength = (input.hairLength ?? profile?.hairLength ?? null) as HairLengthKey | null;

      const missing: string[] = [];
      if (!faceShape) missing.push('faceShape');
      if (!hairType) missing.push('hairType');

      if (missing.length > 0 || !faceShape || !hairType) {
        return {
          matches: [],
          total: 0,
          missing,
          profile: { faceShape: faceShape ?? null, hairType: hairType ?? null, hairLength },
        };
      }

      const chosenRank = hairLength ? HAIR_LENGTH_RANK[hairLength] : null;
      const matches: Array<{ style: HairStyleEntry; score: number; reasons: string[] }> = [];
      for (const style of HAIR_STYLE_CATALOG) {
        if (!style.faceShapes.includes(faceShape)) continue;
        if (!style.hairTypes.includes(hairType)) continue;
        if (
          chosenRank !== null &&
          style.minLength &&
          HAIR_LENGTH_RANK[style.minLength] > chosenRank
        )
          continue;

        const reasons: string[] = [`face_${faceShape}`, `texture_${hairType}`];
        let score = 30 + 25; // face shape + texture
        if (chosenRank !== null) {
          if (style.bestLength === hairLength) {
            score += 20;
            reasons.push(`length_${hairLength}`);
          } else {
            score += 10;
            reasons.push('length_fit');
          }
        }
        matches.push({ style, score, reasons });
      }

      // Stable: score desc, then catalog order.
      const ranked = matches.sort((a, b) => b.score - a.score).slice(0, 5);
      return {
        matches: ranked.map(({ style, score, reasons }) => ({
          style,
          score,
          matchPct: matchPct(score),
          reasons,
        })),
        total: matches.length,
        missing: [],
        profile: { faceShape, hairType, hairLength },
      };
    }),

  // ── Fragrance Match: preferred scents + season → perfumes ──
  fragranceMatch: customerProcedure
    .input(z.object({ season: z.enum(SEASONS).optional() }))
    .query(async ({ ctx, input }) => {
      const profile = await prisma.beautyProfile.findUnique({ where: { userId: ctx.user.id } });
      const preferredScents = profile?.preferredScents ?? [];
      const season: Season = input.season ?? getClimateSeason(new Date());

      if (preferredScents.length === 0) {
        return {
          matches: [],
          total: 0,
          missing: ['preferredScents'],
          season,
          profile: { preferredScents: [] },
        };
      }

      const fragranceCat = await prisma.productCategory.findUnique({
        where: { slug: 'product-fragrance' },
      });
      const products = fragranceCat
        ? await prisma.product.findMany({
            where: {
              isActive: true,
              categoryId: fragranceCat.id,
              attributes: { not: Prisma.DbNull },
            },
            take: 200,
          })
        : [];

      const seasonFamilies = SEASON_FAMILIES[season];
      const matches = products
        .map((p) => ({ product: p, attrs: parseProductAttributes(p.attributes) }))
        .filter(
          (x): x is { product: (typeof products)[number]; attrs: ProductMatchAttributes } =>
            x.attrs?.kind === 'fragrance',
        )
        .map(({ product, attrs }) => {
          if (attrs.kind !== 'fragrance') return null;
          const reasons: string[] = [];
          // +30 per matching scent family, capped at 60 (two families).
          const scentScore = Math.min(
            60,
            preferredScents.filter((s) => s === attrs.fragranceFamily).length * 30,
          );
          if (scentScore > 0) reasons.push(`scent_${attrs.fragranceFamily}`);
          let seasonScore = 0;
          if (attrs.seasons.includes(season)) {
            seasonScore = 25;
            reasons.push(`season_${season}`);
          }
          let familyBonus = 0;
          if (seasonFamilies.includes(attrs.fragranceFamily)) {
            familyBonus = 10;
            reasons.push('season_family');
          }
          return {
            product: productPayload(product),
            score: scentScore + seasonScore + familyBonus,
            reasons,
            // Ranking keys only — stripped from the response.
            sales: product.sales,
            id: product.id,
          };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);

      const ranked = rankProducts(matches).slice(0, 8);
      return {
        matches: ranked.map(({ product, score, reasons }) => ({
          product,
          score,
          matchPct: matchPct(score),
          reasons,
        })),
        total: matches.length,
        missing: [],
        season,
        profile: { preferredScents },
      };
    }),
});
