import { z } from 'zod';

export const createCategorySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.number().int().positive().optional(),
  iconUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createServiceSchema = z.object({
  categoryId: z.number().int().positive(),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  basePrice: z.number().positive(),
  durationMin: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createVariantSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  priceDelta: z.number().default(0),
  durationDelta: z.number().int().default(0),
});

export const createTagSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
});

/** Query-string-safe boolean: accepts real booleans (typed callers) AND
 *  'true'/'false' strings (HTTP query params — z.coerce.boolean() would
 *  read the string "false" as TRUE). */
export const queryBool = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .optional()
  .transform((v) => v === true || v === 'true');

export const serviceQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'duration']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  // 100 = MAX_LIST_SIZE (@galaxy/ui): the booking-create picker needs the full
  // active catalog — a 50 cap silently hides services from the dropdown.
  limit: z.coerce.number().int().min(1).max(100).default(12),
  // E6d — trust badge filters (Tier 2).
  womenOnly: queryBool,
  privateSuite: queryBool,
  pregnancySafe: queryBool,
});

export const addTechnicianServiceSchema = z.object({
  serviceId: z.number().int().positive(),
  customPrice: z.number().positive().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
