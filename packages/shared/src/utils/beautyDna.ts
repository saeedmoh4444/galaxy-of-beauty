/**
 * 3.1 Beauty DNA Phase 3 — match catalogs shared by the API (beautyDna
 * router), the seed, and both UIs. Plain TS types + guards only: this
 * package has no zod dependency (zod schemas live in the api layer).
 */

// ── Enumerations ───────────────────────────────────────────

import type { BEAUTY_PROFILE_OPTIONS } from './beautyProfile';

export const UNDERTONES = ['cool', 'warm', 'neutral'] as const;
export type Undertone = (typeof UNDERTONES)[number];

export const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'diamond', 'long'] as const;
export type FaceShape = (typeof FACE_SHAPES)[number];

export const SEASONS = ['winter', 'spring', 'summer', 'autumn'] as const;
export type Season = (typeof SEASONS)[number];

/**
 * Climate season by UTC month (deterministic for tests) — distinct from
 * saudiCalendar.getSaudiSeason, which tracks Islamic occasions.
 */
export function getClimateSeason(date: Date): Season {
  const m = date.getUTCMonth();
  if (m === 10 || m === 11 || m === 0 || m === 1) return 'winter'; // Nov–Feb
  if (m === 2 || m === 3) return 'spring'; // Mar–Apr
  if (m >= 4 && m <= 8) return 'summer'; // May–Sep
  return 'autumn'; // Oct
}

// ── Product attributes (polymorphic, discriminated by `kind`) ──

export interface MakeupAttributes {
  kind: 'makeup';
  /** Display shade label, e.g. "porcelain" — UI maps to beautyDna.shade.* */
  shade: string;
  /** Hex swatch for the UI, e.g. "#F6E3D0" */
  shadeHex: string;
  undertone: Undertone;
  /** Shade depth 1 (lightest) .. 6 (deepest) — bridge to skinTone. */
  depth: number;
}

export interface FragranceAttributes {
  kind: 'fragrance';
  /** One of BEAUTY_PROFILE_OPTIONS.scents (floral, citrus, woody, ...). */
  fragranceFamily: string;
  seasons: Season[];
}

export type ProductMatchAttributes = MakeupAttributes | FragranceAttributes;

/** Guard for the polymorphic product.attributes payload. */
export function parseProductAttributes(json: unknown): ProductMatchAttributes | null {
  if (json === null || typeof json !== 'object') return null;
  const v = json as Record<string, unknown>;

  if (v['kind'] === 'makeup') {
    if (typeof v['shade'] !== 'string' || typeof v['shadeHex'] !== 'string') return null;
    if (!UNDERTONES.includes(v['undertone'] as Undertone)) return null;
    if (
      typeof v['depth'] !== 'number' ||
      !Number.isInteger(v['depth']) ||
      v['depth'] < 1 ||
      v['depth'] > 6
    ) {
      return null;
    }
    return {
      kind: 'makeup',
      shade: v['shade'],
      shadeHex: v['shadeHex'],
      undertone: v['undertone'] as Undertone,
      depth: v['depth'],
    };
  }

  if (v['kind'] === 'fragrance') {
    if (typeof v['fragranceFamily'] !== 'string') return null;
    if (
      !Array.isArray(v['seasons']) ||
      !(v['seasons'] as unknown[]).every((s) => SEASONS.includes(s as Season))
    ) {
      return null;
    }
    return {
      kind: 'fragrance',
      fragranceFamily: v['fragranceFamily'],
      seasons: v['seasons'] as Season[],
    };
  }

  return null;
}

// ── Skin Match: tone → depth windows ───────────────────────

export const SKIN_TONE_DEPTH: Record<
  (typeof BEAUTY_PROFILE_OPTIONS.skinTones)[number],
  [number, number]
> = {
  fair: [1, 2],
  medium: [2, 3],
  olive: [3, 4],
  tan: [4, 5],
  deep: [5, 6],
};

// ── Hair Match: static style catalog ───────────────────────
// Mirrors the dnaBeauty DNA_TRAITS pattern: static bilingual entries,
// table-ready if a HairStyle model is added later.

export const HAIR_LENGTH_RANK = { short: 0, medium: 1, long: 2 } as const;
export type HairLengthKey = keyof typeof HAIR_LENGTH_RANK;

export interface HairStyleEntry {
  id: string;
  nameJson: { ar: string; en: string };
  descriptionJson: { ar: string; en: string };
  faceShapes: FaceShape[];
  hairTypes: string[]; // straight | wavy | curly | coily
  /** Style needs at least this length to work (rank-compared). */
  minLength?: HairLengthKey;
  /** Length this style looks best at (bonus, never blocks). */
  bestLength?: HairLengthKey;
}

export const HAIR_STYLE_CATALOG: HairStyleEntry[] = [
  // ── Oval (most versatile — every style lands here) ──
  {
    id: 'oval-straight-long-layers',
    nameJson: { ar: 'طبقات طويلة', en: 'Long Layers' },
    descriptionJson: {
      ar: 'طبقات ناعمة تنسدل بطول الوجه وتعزز تناسق الشكل البيضاوي.',
      en: 'Soft flowing layers that frame the face and flatter the oval shape.',
    },
    faceShapes: ['oval'],
    hairTypes: ['straight'],
    minLength: 'medium',
    bestLength: 'long',
  },
  {
    id: 'oval-wavy-beach-waves',
    nameJson: { ar: 'تموجات الشاطئ', en: 'Beach Waves' },
    descriptionJson: {
      ar: 'تموجات طبيعية خفيفة تمنح إطلالة مرحة وتناسب الوجه البيضاوي تماماً.',
      en: 'Loose natural waves that give an effortless look and suit the oval face perfectly.',
    },
    faceShapes: ['oval'],
    hairTypes: ['wavy'],
    minLength: 'medium',
    bestLength: 'long',
  },
  {
    id: 'oval-curly-layered-curls',
    nameJson: { ar: 'كيرات متدرجة', en: 'Layered Curls' },
    descriptionJson: {
      ar: 'تدرجات تحرر التموجات من الثقل وتوزع الحجم بتناسق.',
      en: 'Layers that free the curls from weight and balance the volume.',
    },
    faceShapes: ['oval'],
    hairTypes: ['curly'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'oval-coily-curly-bob',
    nameJson: { ar: 'باب مجعد', en: 'Curly Bob' },
    descriptionJson: {
      ar: 'قصة باب قصيرة تبرز تجاعيد الشعر وملامح الوجه البيضاوي.',
      en: 'A short bob that shows off the coils and the oval face features.',
    },
    faceShapes: ['oval'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'short',
  },
  // ── Round (add height, avoid chin-level width) ──
  {
    id: 'round-straight-face-framing',
    nameJson: { ar: 'طبقات مؤطرة للوجه', en: 'Face-Framing Layers' },
    descriptionJson: {
      ar: 'خصل طويلة أمامية تنحف الوجه وتكسر استدارته بلطف.',
      en: 'Long front strands that slim the face and softly break its roundness.',
    },
    faceShapes: ['round'],
    hairTypes: ['straight'],
    minLength: 'medium',
    bestLength: 'long',
  },
  {
    id: 'round-wavy-side-swept',
    nameJson: { ar: 'تموجات جانبية', en: 'Side-Swept Waves' },
    descriptionJson: {
      ar: 'فرق جانبي مع تموجات يعطي ارتفاعاً بصرياً يطيل الوجه المستدير.',
      en: 'A side part with waves creates visual height that elongates the round face.',
    },
    faceShapes: ['round'],
    hairTypes: ['wavy'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'round-curly-voluminous-shag',
    nameJson: { ar: 'شاج بكثافة علوية', en: 'Voluminous Shag' },
    descriptionJson: {
      ar: 'كثافة عند التاج وخصل متدرجة تحقق التوازن المثالي للوجه المستدير.',
      en: 'Crown volume with graduated strands achieves perfect balance for a round face.',
    },
    faceShapes: ['round'],
    hairTypes: ['curly'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'round-coily-twist-out-height',
    nameJson: { ar: 'تفاصيل بكثافة علوية', en: 'Twist-Out with Height' },
    descriptionJson: {
      ar: 'تسريحة تفاصيل مع ارتفاع علوي تمنح الوجه المستدير طولاً بصرياً.',
      en: 'A twist-out with crown height gives the round face visual length.',
    },
    faceShapes: ['round'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'medium',
  },
  // ── Square (soften the jawline) ──
  {
    id: 'square-straight-soft-layers',
    nameJson: { ar: 'طبقات ناعمة', en: 'Soft Layers' },
    descriptionJson: {
      ar: 'طبقات متدرجة تخفف حدة الفك وتمنح انسيابية للوجه المربع.',
      en: 'Graduated layers soften the jawline and give the square face flow.',
    },
    faceShapes: ['square'],
    hairTypes: ['straight'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'square-wavy-tousled',
    nameJson: { ar: 'تموجات مشعثة', en: 'Tousled Waves' },
    descriptionJson: {
      ar: 'تموجات عشوائية ناعمة تلطف زوايا الوجه المربع.',
      en: 'Soft tousled waves that relax the square face angles.',
    },
    faceShapes: ['square'],
    hairTypes: ['wavy'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'square-curly-loose-curls',
    nameJson: { ar: 'تجعيدات متحررة', en: 'Loose Curls' },
    descriptionJson: {
      ar: 'تجعيدات طويلة متحررة تنعّم ملامح الوجه المربع القوية.',
      en: 'Long loose curls that soften the strong square features.',
    },
    faceShapes: ['square'],
    hairTypes: ['curly'],
    minLength: 'medium',
    bestLength: 'long',
  },
  {
    id: 'square-coily-crown',
    nameJson: { ar: 'تاج التفاصيل', en: 'Coil Crown' },
    descriptionJson: {
      ar: 'تاج كثيف من التفاصيل يرفع الأنظار عن الفك ويحقق توازناً جميلاً.',
      en: 'A full coil crown that draws the eye up from the jaw for beautiful balance.',
    },
    faceShapes: ['square'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'short',
  },
  // ── Heart (balance the forehead) ──
  {
    id: 'heart-straight-side-parted-lob',
    nameJson: { ar: 'لوب بفرق جانبي', en: 'Side-Parted Lob' },
    descriptionJson: {
      ar: 'قصة لوب بفرق جانبي توازن الجبهة العريضة وتبرز الذقن النحيل.',
      en: 'A side-parted lob that balances a wide forehead and flatters the narrow chin.',
    },
    faceShapes: ['heart'],
    hairTypes: ['straight'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'heart-wavy-bob',
    nameJson: { ar: 'باب مموج', en: 'Wavy Bob' },
    descriptionJson: {
      ar: 'باب بطول الذقن مع تموجات يملأ منطقة الذقن بتوازن.',
      en: 'A chin-length bob with waves that fills the chin area evenly.',
    },
    faceShapes: ['heart'],
    hairTypes: ['wavy'],
    minLength: 'short',
    bestLength: 'short',
  },
  {
    id: 'heart-curly-bob',
    nameJson: { ar: 'باب كيرلي', en: 'Curly Bob' },
    descriptionJson: {
      ar: 'تجعيدات قصيرة تمنح حجماً عند الذقن وتوازن الوجه القلبي.',
      en: 'Short curls that add chin volume and balance the heart face.',
    },
    faceShapes: ['heart'],
    hairTypes: ['curly'],
    minLength: 'short',
    bestLength: 'short',
  },
  {
    id: 'heart-coily-pixie',
    nameJson: { ar: 'بيكسي كويلي', en: 'Coily Pixie' },
    descriptionJson: {
      ar: 'قصة بيكسي قصيرة تبرز العينين وتخفف ثقل الجبهة.',
      en: 'A short pixie that highlights the eyes and lightens the forehead.',
    },
    faceShapes: ['heart'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'short',
  },
  // ── Diamond (widen the forehead, narrow the cheeks) ──
  {
    id: 'diamond-straight-side-swept-long',
    nameJson: { ar: 'خصل طويلة جانبية', en: 'Side-Swept Long Layers' },
    descriptionJson: {
      ar: 'غرة جانبية طويلة تضيق عظام الوجنتين البارزة وتوازن الوجه المعيني.',
      en: 'Long side-swept bangs that narrow prominent cheekbones and balance the diamond face.',
    },
    faceShapes: ['diamond'],
    hairTypes: ['straight'],
    minLength: 'medium',
    bestLength: 'long',
  },
  {
    id: 'diamond-wavy-soft-waves',
    nameJson: { ar: 'تموجات هادئة', en: 'Soft Waves' },
    descriptionJson: {
      ar: 'تموجات تحت الذقن تخفف حدة عظام الوجنتين بلطف.',
      en: 'Below-chin waves that gently soften the cheekbones.',
    },
    faceShapes: ['diamond'],
    hairTypes: ['wavy'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'diamond-curly-shoulder-curls',
    nameJson: { ar: 'تجعيدات الكتف', en: 'Shoulder Curls' },
    descriptionJson: {
      ar: 'تجعيدات بطول الكتف تعطي امتلاءً يوازن الوجه المعيني.',
      en: 'Shoulder-length curls that add fullness to balance the diamond face.',
    },
    faceShapes: ['diamond'],
    hairTypes: ['curly'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'diamond-coily-bob',
    nameJson: { ar: 'باب كويلي', en: 'Coily Bob' },
    descriptionJson: {
      ar: 'باب كويلي قصير يلفت النظر للعينين ويوازن عظام الوجنتين.',
      en: 'A short coily bob that draws focus to the eyes and balances the cheekbones.',
    },
    faceShapes: ['diamond'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'short',
  },
  // ── Long (avoid extra length, add width) ──
  {
    id: 'long-straight-shoulder-volume',
    nameJson: { ar: 'قصّة الكتف بحجم', en: 'Shoulder Cut with Volume' },
    descriptionJson: {
      ar: 'قصّة بطول الكتف مع كثافة جانبية تقصّر الوجه الطويل بصرياً.',
      en: 'A shoulder cut with side volume that visually shortens the long face.',
    },
    faceShapes: ['long'],
    hairTypes: ['straight'],
    minLength: 'short',
    bestLength: 'short',
  },
  {
    id: 'long-wavy-mid-length',
    nameJson: { ar: 'تموجات متوسطة الطول', en: 'Mid-Length Waves' },
    descriptionJson: {
      ar: 'تموجات متوسطة تعطي عرضاً للوجه الطويل وتخفف طوله.',
      en: 'Mid-length waves that add width to the long face and reduce its length.',
    },
    faceShapes: ['long'],
    hairTypes: ['wavy'],
    minLength: 'medium',
    bestLength: 'medium',
  },
  {
    id: 'long-curly-voluminous',
    nameJson: { ar: 'تجعيدات كثيفة', en: 'Voluminous Curls' },
    descriptionJson: {
      ar: 'تجعيدات كثيفة قصيرة تمنح امتلاءً جانبياً يوازن الوجه الطويل.',
      en: 'Short voluminous curls that add side fullness to balance the long face.',
    },
    faceShapes: ['long'],
    hairTypes: ['curly'],
    minLength: 'short',
    bestLength: 'short',
  },
  {
    id: 'long-coily-rounded-afro',
    nameJson: { ar: 'أفرو دائري', en: 'Rounded Afro' },
    descriptionJson: {
      ar: 'أفرو دائري متساوٍ يمنح الوجه الطويل عرضاً وتناسقاً مثالياً.',
      en: 'An even rounded afro that gives the long face ideal width and proportion.',
    },
    faceShapes: ['long'],
    hairTypes: ['coily'],
    minLength: 'short',
    bestLength: 'short',
  },
];
