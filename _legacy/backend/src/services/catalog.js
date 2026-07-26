import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { cacheWithTTL, invalidateCache } from '../config/redis.js';
import logger from '../config/logger.js';

const CATEGORY_CACHE_KEY = 'categories:tree';
const CATEGORY_CACHE_TTL = 3600; // 1 hour
const SERVICE_CACHE_PREFIX = 'services:';
const SERVICE_CACHE_TTL = 600; // 10 minutes

// =============================================================================
// Categories
// =============================================================================

/**
 * Build a nested category tree from a flat list.
 * Uses parentId to nest children under their parent.
 *
 * @param {Array} categories - Flat array of categories
 * @param {number|null} parentId - Parent ID to filter by
 * @returns {Array} Nested tree
 */
function buildCategoryTree(categories, parentId = null) {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all categories as a nested tree.
 * Results are cached in Redis for 1 hour.
 *
 * @param {boolean} activeOnly - Only include active categories
 * @returns {Promise<Array>}
 */
export async function getCategoryTree(activeOnly = true) {
  const cacheKey = `${CATEGORY_CACHE_KEY}:${activeOnly ? 'active' : 'all'}`;

  return cacheWithTTL(cacheKey, async () => {
    const where = activeOnly ? { isActive: true } : {};
    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return buildCategoryTree(categories);
  }, CATEGORY_CACHE_TTL);
}

/**
 * Get a single category by ID.
 *
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true, parent: true },
  });
  if (!category) {
    throw new AppError('Category not found', 404, ErrorCodes.NOT_FOUND);
  }
  return category;
}

/**
 * Create a new category.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createCategory(data) {
  // Check slug uniqueness
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new AppError('A category with this slug already exists', 409, ErrorCodes.ALREADY_EXISTS);
  }

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw new AppError('Parent category not found', 404, ErrorCodes.NOT_FOUND);
    }
  }

  const category = await prisma.category.create({ data });
  await invalidateCache(`${CATEGORY_CACHE_KEY}:*`);
  logger.info('Category created', { id: category.id, slug: category.slug });
  return category;
}

/**
 * Update a category.
 *
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateCategory(id, data) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError('Category not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (data.slug && data.slug !== category.slug) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new AppError('Slug already taken', 409, ErrorCodes.ALREADY_EXISTS);
    }
  }

  const updated = await prisma.category.update({ where: { id }, data });
  await invalidateCache(`${CATEGORY_CACHE_KEY}:*`);
  logger.info('Category updated', { id });
  return updated;
}

/**
 * Delete a category (only if no services reference it).
 *
 * @param {number} id
 */
export async function deleteCategory(id) {
  const serviceCount = await prisma.service.count({ where: { categoryId: id } });
  if (serviceCount > 0) {
    throw new AppError(
      'Cannot delete category with existing services. Remove or reassign services first.',
      400,
      ErrorCodes.INVALID_INPUT,
    );
  }

  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new AppError('Cannot delete category with subcategories', 400, ErrorCodes.INVALID_INPUT);
  }

  await prisma.category.delete({ where: { id } });
  await invalidateCache(`${CATEGORY_CACHE_KEY}:*`);
  logger.info('Category deleted', { id });
}

// =============================================================================
// Services
// =============================================================================

/**
 * List services with filtering, search, pagination, and sorting.
 *
 * @param {object} options
 * @returns {Promise<{ services: Array, pagination: object }>}
 */
export async function listServices(options = {}) {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    isPopular,
    isActive,
    page = 1,
    limit = 20,
    includeVariants = false,
    includeAddons = false,
    sortBy = 'newest',
  } = options;

  const skip = (page - 1) * limit;
  const where = {};

  if (categoryId) {
    // Include subcategories
    const subcategories = await prisma.category.findMany({
      where: { OR: [{ id: categoryId }, { parentId: categoryId }] },
      select: { id: true },
    });
    where.categoryId = { in: subcategories.map((c) => c.id) };
  }

  if (search) {
    // PostgreSQL JSONB text search on title
    where.OR = [
      { titleJson: { path: ['ar'], string_contains: search } },
      { titleJson: { path: ['en'], string_contains: search } },
      { descriptionJson: { path: ['ar'], string_contains: search } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) where.basePrice.gte = minPrice;
    if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
  }

  if (isPopular !== undefined) where.isPopular = isPopular;
  if (isActive !== undefined) where.isActive = isActive;
  else where.isActive = true; // Default: only active services

  // Sorting
  let orderBy;
  switch (sortBy) {
    case 'price': orderBy = { basePrice: 'asc' }; break;
    case '-price': orderBy = { basePrice: 'desc' }; break;
    case 'popularity': orderBy = { isPopular: 'desc' }; break;
    case 'duration': orderBy = { durationMin: 'asc' }; break;
    case 'newest':
    default: orderBy = { createdAt: 'desc' }; break;
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: { select: { id: true, nameJson: true, slug: true } },
        ...(includeVariants && { variants: { where: { isActive: true } } }),
        ...(includeAddons && { servicesWithAddon: { include: { addon: true } } }),
        tags: { include: { tag: true } },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get service by ID with variants, add-ons, and tags.
 *
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getServiceById(id) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { where: { isActive: true } },
      servicesWithAddon: {
        where: { isActive: true },
        include: {
          addon: { select: { id: true, titleJson: true, basePrice: true, durationMin: true } },
        },
      },
      tags: { include: { tag: true } },
      technicianServices: {
        where: { isActive: true },
        select: {
          technician: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          customPrice: true,
        },
      },
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404, ErrorCodes.NOT_FOUND);
  }

  return service;
}

/**
 * Create a new service.
 *
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createService(data) {
  // Validate category exists
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new AppError('Category not found', 404, ErrorCodes.NOT_FOUND);
  }

  const service = await prisma.service.create({ data });
  await invalidateCache(`${SERVICE_CACHE_PREFIX}*`);
  logger.info('Service created', { id: service.id });
  return service;
}

/**
 * Update a service.
 *
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateService(id, data) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new AppError('Service not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError('Category not found', 404, ErrorCodes.NOT_FOUND);
  }

  const updated = await prisma.service.update({ where: { id }, data });
  await invalidateCache(`${SERVICE_CACHE_PREFIX}*`);
  logger.info('Service updated', { id });
  return updated;
}

/**
 * Delete a service (only if no bookings reference it).
 *
 * @param {number} id
 */
export async function deleteService(id) {
  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) {
    throw new AppError(
      'Cannot delete service with existing bookings. Deactivate it instead.',
      400,
      ErrorCodes.INVALID_INPUT,
    );
  }
  await prisma.service.delete({ where: { id } });
  await invalidateCache(`${SERVICE_CACHE_PREFIX}*`);
  logger.info('Service deleted', { id });
}

// =============================================================================
// Service Variants
// =============================================================================

export async function createVariant(data) {
  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) throw new AppError('Service not found', 404, ErrorCodes.NOT_FOUND);

  return prisma.serviceVariant.create({ data });
}

export async function updateVariant(id, data) {
  const variant = await prisma.serviceVariant.findUnique({ where: { id } });
  if (!variant) throw new AppError('Variant not found', 404, ErrorCodes.NOT_FOUND);

  return prisma.serviceVariant.update({ where: { id }, data });
}

export async function deleteVariant(id) {
  const variant = await prisma.serviceVariant.findUnique({ where: { id } });
  if (!variant) throw new AppError('Variant not found', 404, ErrorCodes.NOT_FOUND);

  return prisma.serviceVariant.delete({ where: { id } });
}

// =============================================================================
// Service Addons
// =============================================================================

export async function addAddonToService(serviceId, addonId) {
  const [service, addon] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.service.findUnique({ where: { id: addonId } }),
  ]);
  if (!service || !addon) throw new AppError('Service not found', 404, ErrorCodes.NOT_FOUND);
  if (serviceId === addonId) throw new AppError('A service cannot be an add-on to itself', 400, ErrorCodes.INVALID_INPUT);

  return prisma.serviceAddon.upsert({
    where: { serviceId_addonId: { serviceId, addonId } },
    create: { serviceId, addonId },
    update: { isActive: true },
  });
}

export async function removeAddonFromService(serviceId, addonId) {
  return prisma.serviceAddon.deleteMany({
    where: { serviceId, addonId },
  });
}

// =============================================================================
// Service Tags
// =============================================================================

export async function createTag(data) {
  const existing = await prisma.serviceTag.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError('Tag slug already exists', 409, ErrorCodes.ALREADY_EXISTS);
  return prisma.serviceTag.create({ data });
}

export async function assignTagToService(serviceId, tagId) {
  return prisma.serviceTagAssignment.upsert({
    where: { serviceId_tagId: { serviceId, tagId } },
    create: { serviceId, tagId },
    update: {},
  });
}

export async function removeTagFromService(serviceId, tagId) {
  return prisma.serviceTagAssignment.deleteMany({ where: { serviceId, tagId } });
}

// =============================================================================
// Technician-Service Mapping
// =============================================================================

export async function getTechnicianServices(technicianId) {
  return prisma.technicianService.findMany({
    where: { technicianId, isActive: true },
    include: {
      service: {
        select: {
          id: true,
          titleJson: true,
          basePrice: true,
          durationMin: true,
          categoryId: true,
        },
      },
    },
  });
}

export async function addServiceToTechnician(technicianId, serviceId, customPrice) {
  return prisma.technicianService.upsert({
    where: { technicianId_serviceId: { technicianId, serviceId } },
    create: { technicianId, serviceId, customPrice },
    update: { customPrice, isActive: true },
  });
}

export async function updateTechnicianService(id, data) {
  const mapping = await prisma.technicianService.findUnique({ where: { id } });
  if (!mapping) throw new AppError('Technician-service mapping not found', 404, ErrorCodes.NOT_FOUND);
  return prisma.technicianService.update({ where: { id }, data });
}

export async function removeServiceFromTechnician(id) {
  return prisma.technicianService.update({
    where: { id },
    data: { isActive: false },
  });
}

export default {
  // Categories
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Services
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  // Variants
  createVariant,
  updateVariant,
  deleteVariant,
  // Addons
  addAddonToService,
  removeAddonFromService,
  // Tags
  createTag,
  assignTagToService,
  removeTagFromService,
  // Tech mapping
  getTechnicianServices,
  addServiceToTechnician,
  updateTechnicianService,
  removeServiceFromTechnician,
};
