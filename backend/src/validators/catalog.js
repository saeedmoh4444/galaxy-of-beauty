import { z } from 'zod';

// =============================================================================
// Category Schemas
// =============================================================================

export const createCategorySchema = z.object({
  nameJson: z.object({
    ar: z.string().min(1, 'Arabic name is required').max(100),
    en: z.string().min(1, 'English name is required').max(100),
  }),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  iconUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  parentId: z.number().int().positive().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

// =============================================================================
// Service Schemas
// =============================================================================

export const createServiceSchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  titleJson: z.object({
    ar: z.string().min(1, 'Arabic title is required').max(200),
    en: z.string().min(1, 'English title is required').max(200),
  }),
  descriptionJson: z.object({
    ar: z.string().max(2000).optional().default(''),
    en: z.string().max(2000).optional().default(''),
  }).optional(),
  basePrice: z.number().positive('Price must be greater than 0').max(100000),
  durationMin: z.number().int().positive('Duration must be positive').max(480),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isPopular: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

// =============================================================================
// Service Variant Schemas
// =============================================================================

export const createVariantSchema = z.object({
  serviceId: z.number().int().positive(),
  nameJson: z.object({
    ar: z.string().min(1).max(100),
    en: z.string().min(1).max(100),
  }),
  priceDelta: z.number().min(-100000).max(100000).optional().default(0),
  durationDelta: z.number().int().min(-240).max(240).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateVariantSchema = z.object({
  nameJson: z.object({ ar: z.string().min(1).max(100), en: z.string().min(1).max(100) }).optional(),
  priceDelta: z.number().optional(),
  durationDelta: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// =============================================================================
// Service Addon Schemas
// =============================================================================

export const manageAddonSchema = z.object({
  addonId: z.number().int().positive(),
});

// =============================================================================
// Service Tag Schemas
// =============================================================================

export const createTagSchema = z.object({
  nameJson: z.object({
    ar: z.string().min(1).max(100),
    en: z.string().min(1).max(100),
  }),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export const assignTagSchema = z.object({
  tagId: z.number().int().positive(),
});

// =============================================================================
// Technician-Service Mapping Schemas
// =============================================================================

export const addTechnicianServiceSchema = z.object({
  serviceId: z.number().int().positive(),
  customPrice: z.number().positive().max(100000).optional().nullable(),
});

export const updateTechnicianServiceSchema = z.object({
  customPrice: z.number().positive().max(100000).optional().nullable(),
  isActive: z.boolean().optional(),
});

// =============================================================================
// Search / Query Schemas
// =============================================================================

export const serviceQuerySchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().max(100000).optional(),
  isPopular: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  includeVariants: z.coerce.boolean().optional().default(false),
  includeAddons: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(['price', '-price', 'popularity', 'newest', 'duration']).optional().default('newest'),
});

export default {
  createCategory: createCategorySchema,
  updateCategory: updateCategorySchema,
  createService: createServiceSchema,
  updateService: updateServiceSchema,
  createVariant: createVariantSchema,
  updateVariant: updateVariantSchema,
  manageAddon: manageAddonSchema,
  createTag: createTagSchema,
  assignTag: assignTagSchema,
  addTechnicianService: addTechnicianServiceSchema,
  updateTechnicianService: updateTechnicianServiceSchema,
  serviceQuery: serviceQuerySchema,
};
